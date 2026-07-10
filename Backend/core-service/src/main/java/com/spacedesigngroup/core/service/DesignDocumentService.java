package com.spacedesigngroup.core.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.DocumentRequest;
import com.spacedesigngroup.core.dto.DocumentResponse;
import com.spacedesigngroup.core.dto.PortfolioAnalysisResponse;
import com.spacedesigngroup.core.dto.ai.AiPortfolioAnalyzeRequestPayload;
import com.spacedesigngroup.core.dto.ai.AiPortfolioAnalyzeResultPayload;
import com.spacedesigngroup.core.dto.ai.AiPortfolioFilePayload;
import com.spacedesigngroup.core.model.DesignDocument;
import com.spacedesigngroup.core.model.DocumentStatus;
import com.spacedesigngroup.core.model.MilestoneItem;
import com.spacedesigngroup.core.model.PortfolioTaskRecommendation;
import com.spacedesigngroup.core.model.ProjectRecord;
import com.spacedesigngroup.core.repository.DesignDocumentRepository;
import com.spacedesigngroup.core.repository.PortfolioTaskRecommendationRepository;
import com.spacedesigngroup.core.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DesignDocumentService {

    private final DesignDocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final S3Service s3Service;
    private final AiServiceClient aiServiceClient;
    private final PortfolioTaskRecommendationRepository portfolioTaskRecommendationRepository;
    private final ObjectMapper objectMapper;

    public List<DocumentResponse> findAll() {
        return documentRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<DocumentResponse> findApproved() {
        return documentRepository.findByApprovalBadgeStatus(DocumentStatus.APPROVED).stream()
                .map(this::toResponse).toList();
    }

    public DocumentResponse uploadFile(Long projectId, MultipartFile file) throws IOException {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("ProjectRecord", projectId));
        String key = s3Service.uploadFile(file, "design-progress", projectId);
        DesignDocument doc = DesignDocument.builder()
                .project(project)
                .fileStorageUrl(s3Service.publicUrl(key))
                .fileVersion(1)
                .approvalBadgeStatus(DocumentStatus.PENDING)
                .build();
        return toResponse(documentRepository.save(doc));
    }

    public List<DocumentResponse> findByProject(Long projectId) {
        return documentRepository.findByProjectId(projectId).stream().map(this::toResponse).toList();
    }

    public DocumentResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public DocumentResponse upload(DocumentRequest request) {
        var project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> ResourceNotFoundException.forEntity("ProjectRecord", request.projectId()));
        DesignDocument doc = DesignDocument.builder()
                .project(project)
                .fileStorageUrl(request.fileStorageUrl())
                .fileVersion(1)
                .approvalBadgeStatus(DocumentStatus.PENDING)
                .build();
        return toResponse(documentRepository.save(doc));
    }

    public DocumentResponse incrementVersion(Long id) {
        DesignDocument doc = getOrThrow(id);
        doc.setFileVersion(doc.getFileVersion() + 1);
        doc.setApprovalBadgeStatus(DocumentStatus.PENDING);
        return toResponse(documentRepository.save(doc));
    }

    public DocumentResponse updateStatus(Long id, DocumentStatus status) {
        DesignDocument doc = getOrThrow(id);
        doc.setApprovalBadgeStatus(status);
        return toResponse(documentRepository.save(doc));
    }

    public PortfolioAnalysisResponse analyze(Long documentId) {
        DesignDocument doc = getOrThrow(documentId);
        ProjectRecord project = doc.getProject();
        List<String> milestoneTitles = parseMilestoneTitles(project.getMilestoneChecklistJson());

        AiPortfolioAnalyzeResultPayload result = aiServiceClient.analyzePortfolio(new AiPortfolioAnalyzeRequestPayload(
                List.of(new AiPortfolioFilePayload(doc.getFileStorageUrl())),
                milestoneTitles
        ));

        PortfolioTaskRecommendation saved = portfolioTaskRecommendationRepository.save(PortfolioTaskRecommendation.builder()
                .document(doc)
                .recommendedTaskTitlesJson(toJson(result.recommendedTaskTitles()))
                .reasoning(result.reasoning())
                .build());

        return new PortfolioAnalysisResponse(saved.getId(), result.recommendedTaskTitles(), result.reasoning(), saved.getCreatedAt());
    }

    private List<String> parseMilestoneTitles(String milestoneChecklistJson) {
        if (milestoneChecklistJson == null || milestoneChecklistJson.isBlank()) return Collections.emptyList();
        try {
            List<MilestoneItem> milestones = objectMapper.readValue(milestoneChecklistJson, new TypeReference<>() {});
            return milestones.stream().filter(m -> !m.isAchieved()).map(MilestoneItem::name).toList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String toJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values);
        } catch (Exception e) {
            return "[]";
        }
    }

    private DesignDocument getOrThrow(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("DesignDocument", id));
    }

    private DocumentResponse toResponse(DesignDocument d) {
        return new DocumentResponse(d.getId(), d.getProject().getId(),
                d.getFileStorageUrl(), d.getFileVersion(), d.getApprovalBadgeStatus());
    }
}
