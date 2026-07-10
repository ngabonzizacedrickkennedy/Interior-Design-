package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.StageRequestBody;
import com.spacedesigngroup.core.dto.StagedVisualizationResponse;
import com.spacedesigngroup.core.dto.ai.AiStageRequestPayload;
import com.spacedesigngroup.core.dto.ai.AiStageResultPayload;
import com.spacedesigngroup.core.model.AttachmentCategory;
import com.spacedesigngroup.core.model.RequestAttachment;
import com.spacedesigngroup.core.model.ServiceRequest;
import com.spacedesigngroup.core.model.StagedVisualization;
import com.spacedesigngroup.core.repository.RequestAttachmentRepository;
import com.spacedesigngroup.core.repository.StagedVisualizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StagingService {

    private final StagedVisualizationRepository stagedVisualizationRepository;
    private final RequestAttachmentRepository attachmentRepository;
    private final ServiceRequestService serviceRequestService;
    private final AiServiceClient aiServiceClient;
    private final S3Service s3Service;

    public StagedVisualizationResponse generate(Long requestId, User caller, StageRequestBody body) {
        ServiceRequest request = serviceRequestService.getOwnedOrThrow(requestId, caller);

        RequestAttachment attachment = attachmentRepository.findByIdAndRequestId(body.attachmentId(), requestId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("RequestAttachment", body.attachmentId()));
        if (attachment.getCategory() != AttachmentCategory.ROOM_PHOTO) {
            throw new IllegalArgumentException("Only a room photo can be used for virtual staging");
        }

        String sourceUrl = s3Service.publicUrl(attachment.getS3Key());
        AiStageResultPayload result = aiServiceClient.generateStagedImage(
                new AiStageRequestPayload(sourceUrl, body.style().name(), request.getRoomType()));

        byte[] imageBytes = Base64.getDecoder().decode(result.imageBase64());
        String s3Key = s3Service.uploadStagedImage(imageBytes, requestId);

        StagedVisualization saved = stagedVisualizationRepository.save(StagedVisualization.builder()
                .request(request)
                .sourceAttachment(attachment)
                .style(body.style())
                .s3Key(s3Key)
                .build());

        return toResponse(saved);
    }

    public List<StagedVisualizationResponse> history(Long requestId, User caller) {
        serviceRequestService.getOwnedOrThrow(requestId, caller);
        return stagedVisualizationRepository.findByRequestIdOrderByCreatedAtDesc(requestId).stream()
                .map(this::toResponse)
                .toList();
    }

    private StagedVisualizationResponse toResponse(StagedVisualization sv) {
        return new StagedVisualizationResponse(
                sv.getId(),
                sv.getRequest().getId(),
                sv.getSourceAttachment() != null ? s3Service.publicUrl(sv.getSourceAttachment().getS3Key()) : null,
                s3Service.publicUrl(sv.getS3Key()),
                sv.getStyle(),
                sv.getCreatedAt()
        );
    }
}
