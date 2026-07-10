package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.DesignerProfileLinksUpdateRequest;
import com.spacedesigngroup.core.dto.DesignerProfileResponse;
import com.spacedesigngroup.core.dto.DesignerSummaryResponse;
import com.spacedesigngroup.core.dto.NotificationRequest;
import com.spacedesigngroup.core.dto.ai.AiCandidateSummaryRequestPayload;
import com.spacedesigngroup.core.dto.ai.AiCandidateSummaryResultPayload;
import com.spacedesigngroup.core.dto.ai.AiCvAnalyzeRequestPayload;
import com.spacedesigngroup.core.dto.ai.AiCvAnalyzeResultPayload;
import com.spacedesigngroup.core.model.DesignerProfile;
import com.spacedesigngroup.core.model.DispatchChannel;
import com.spacedesigngroup.core.model.DocumentStatus;
import com.spacedesigngroup.core.repository.DesignerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DesignerProfileService {

    private final DesignerProfileRepository designerProfileRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final AiServiceClient aiServiceClient;
    private final NotificationService notificationService;

    public DesignerProfileResponse getOrCreateForMe(Long userId) {
        return toResponse(getOrCreateProfile(userId));
    }

    public DesignerProfileResponse updateLinks(Long userId, DesignerProfileLinksUpdateRequest body) {
        DesignerProfile profile = getOrCreateProfile(userId);
        profile.setGithubUrl(body.githubUrl());
        profile.setPortfolioUrl(body.portfolioUrl());
        profile.setOtherLinkUrl(body.otherLinkUrl());
        recomputeCompletion(profile);
        profile.setUpdatedAt(LocalDateTime.now());
        return toResponse(designerProfileRepository.save(profile));
    }

    public DesignerProfileResponse uploadCv(Long userId, MultipartFile file) throws IOException {
        DesignerProfile profile = getOrCreateProfile(userId);

        String key = s3Service.uploadDesignerCv(file, userId);
        profile.setCvFileKey(key);
        profile.setCvOriginalFilename(file.getOriginalFilename());

        try {
            AiCvAnalyzeResultPayload result = aiServiceClient.analyzeCv(new AiCvAnalyzeRequestPayload(s3Service.publicUrl(key)));
            profile.setCvIsValidDocument(result.isCv());
            profile.setCvStrengthScore(result.strengthScore());
            profile.setCvReasoning(result.reasoning());
            profile.setCvAnalyzedAt(LocalDateTime.now());
        } catch (Exception ex) {
            // The file is already safely uploaded — never lose that because the AI analysis step
            // (a separate, best-effort call) failed. The designer can retry analysis by re-uploading.
            profile.setCvIsValidDocument(null);
            profile.setCvStrengthScore(null);
            profile.setCvReasoning("AI analysis could not be completed right now. Your CV was still saved — try re-uploading later to get a strength score.");
            profile.setCvAnalyzedAt(null);
        }

        recomputeCompletion(profile);
        profile.setUpdatedAt(LocalDateTime.now());
        return toResponse(designerProfileRepository.save(profile));
    }

    public List<DesignerProfileResponse> listCandidates(Long callerUserId) {
        return designerProfileRepository.findByApprovalStatus(DocumentStatus.APPROVED).stream()
                .filter(p -> !p.getUser().getId().equals(callerUserId))
                .map(this::toResponse)
                .toList();
    }

    public List<DesignerProfileResponse> listAll() {
        return designerProfileRepository.findAll().stream().map(this::toResponse).toList();
    }

    public DesignerSummaryResponse aiSummary(Long designerProfileId) {
        DesignerProfile profile = designerProfileRepository.findById(designerProfileId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("DesignerProfile", designerProfileId));

        AiCandidateSummaryResultPayload result = aiServiceClient.summarizeCandidate(new AiCandidateSummaryRequestPayload(
                profile.getCvFileKey() != null ? s3Service.publicUrl(profile.getCvFileKey()) : null,
                profile.getGithubUrl(),
                profile.getPortfolioUrl(),
                profile.getOtherLinkUrl()
        ));

        profile.setCapabilitySummaryCache(result.summary());
        designerProfileRepository.save(profile);
        return new DesignerSummaryResponse(result.summary());
    }

    public DesignerProfileResponse approve(Long designerProfileId) {
        return setApprovalStatus(designerProfileId, DocumentStatus.APPROVED,
                "Your designer profile has been approved. You can now create or join a Staff team.");
    }

    public DesignerProfileResponse reject(Long designerProfileId) {
        return setApprovalStatus(designerProfileId, DocumentStatus.REJECTED,
                "Your designer profile has been reviewed and was not approved. Please update your professional background and try again.");
    }

    private DesignerProfileResponse setApprovalStatus(Long designerProfileId, DocumentStatus status, String message) {
        DesignerProfile profile = designerProfileRepository.findById(designerProfileId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("DesignerProfile", designerProfileId));
        profile.setApprovalStatus(status);
        profile.setUpdatedAt(LocalDateTime.now());
        DesignerProfile saved = designerProfileRepository.save(profile);

        notificationService.send(new NotificationRequest(profile.getUser().getId(), DispatchChannel.IN_APP, message));
        return toResponse(saved);
    }

    public void applyInterviewResult(Long designerProfileId, Integer score, String reasoning) {
        DesignerProfile profile = designerProfileRepository.findById(designerProfileId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("DesignerProfile", designerProfileId));
        profile.setInterviewScore(score);
        profile.setInterviewReasoning(reasoning);
        recomputeCompletion(profile);
        profile.setUpdatedAt(LocalDateTime.now());
        designerProfileRepository.save(profile);
    }

    public DesignerProfile getOrCreateProfileEntity(Long userId) {
        return getOrCreateProfile(userId);
    }

    private DesignerProfile getOrCreateProfile(Long userId) {
        return designerProfileRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> ResourceNotFoundException.forEntity("User", userId));
            return designerProfileRepository.save(DesignerProfile.builder().user(user).build());
        });
    }

    private void recomputeCompletion(DesignerProfile profile) {
        int completed = 0;
        if (profile.getCvFileKey() != null) completed++;
        if (profile.getGithubUrl() != null && !profile.getGithubUrl().isBlank()) completed++;
        if (profile.getPortfolioUrl() != null && !profile.getPortfolioUrl().isBlank()) completed++;
        if (profile.getOtherLinkUrl() != null && !profile.getOtherLinkUrl().isBlank()) completed++;
        if (profile.getInterviewScore() != null) completed++;
        profile.setProfileCompletionPercent(completed * 20);
    }

    private DesignerProfileResponse toResponse(DesignerProfile p) {
        return new DesignerProfileResponse(
                p.getId(),
                p.getUser().getId(),
                p.getUser().getFullName(),
                p.getUser().getEmail(),
                p.getCvFileKey() != null ? s3Service.publicUrl(p.getCvFileKey()) : null,
                p.getCvOriginalFilename(),
                p.getGithubUrl(),
                p.getPortfolioUrl(),
                p.getOtherLinkUrl(),
                p.getCvIsValidDocument(),
                p.getCvStrengthScore(),
                p.getCvReasoning(),
                p.getCvAnalyzedAt(),
                p.getInterviewScore(),
                p.getInterviewReasoning(),
                p.getCapabilitySummaryCache(),
                p.getApprovalStatus(),
                p.getProfileCompletionPercent(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
