package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.dto.ai.*;
import com.spacedesigngroup.core.model.ServiceRequest;
import com.spacedesigngroup.core.repository.RequestAttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AiAssessRequestPayloadFactory {

    private final RequestAttachmentRepository attachmentRepository;
    private final S3Service s3Service;

    public AiAssessRequestPayload build(ServiceRequest request) {
        AiDimensionsPayload dimensions = new AiDimensionsPayload(
                request.getLengthMeters(),
                request.getWidthMeters(),
                request.getCeilingHeightMeters(),
                request.getSpatialNotes()
        );
        AiSpaceUsagePayload spaceUsage = new AiSpaceUsagePayload(
                request.isWorksFromHome(),
                request.isEntertainsOften(),
                request.isHasKids(),
                request.isHasPets(),
                request.getStorageNeeds()
        );
        AiLightingPayload lighting = new AiLightingPayload(
                request.getWindowDirection() != null ? request.getWindowDirection().name() : null,
                request.getNaturalLightLevel() != null ? request.getNaturalLightLevel().name() : null,
                request.getArtificialLightingNotes()
        );
        List<String> styleTags = request.getStyleTags().stream().map(Enum::name).toList();
        List<AiAttachmentPayload> attachments = attachmentRepository.findByRequestId(request.getId()).stream()
                .map(a -> new AiAttachmentPayload(a.getCategory().name(), s3Service.publicUrl(a.getS3Key()), a.getNote()))
                .toList();

        return new AiAssessRequestPayload(
                request.getId(),
                request.getRoomType(),
                request.getRequestDetails(),
                dimensions,
                request.getBudgetMin(),
                request.getBudgetMax(),
                styleTags,
                spaceUsage,
                lighting,
                request.getTimeline() != null ? request.getTimeline().name() : null,
                request.getAvoidNotes(),
                request.getSourcingLocation(),
                attachments
        );
    }
}
