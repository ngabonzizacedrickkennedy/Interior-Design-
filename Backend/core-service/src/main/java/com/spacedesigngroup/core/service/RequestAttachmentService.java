package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.AttachmentNoteUpdateRequest;
import com.spacedesigngroup.core.dto.AttachmentResponse;
import com.spacedesigngroup.core.model.AttachmentCategory;
import com.spacedesigngroup.core.model.RequestAttachment;
import com.spacedesigngroup.core.model.RequestStatus;
import com.spacedesigngroup.core.model.ServiceRequest;
import com.spacedesigngroup.core.repository.RequestAttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RequestAttachmentService {

    private final RequestAttachmentRepository attachmentRepository;
    private final ServiceRequestService serviceRequestService;
    private final S3Service s3Service;

    public AttachmentResponse upload(Long requestId, User caller, MultipartFile file,
                                      AttachmentCategory category, String note) throws IOException {
        ServiceRequest request = serviceRequestService.getOwnedOrThrow(requestId, caller);
        String s3Key = s3Service.uploadFile(file, category.name(), requestId);

        RequestAttachment attachment = RequestAttachment.builder()
                .request(request)
                .category(category)
                .s3Key(s3Key)
                .originalFileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .note(note)
                .build();
        attachment = attachmentRepository.save(attachment);
        return toResponse(attachment);
    }

    public List<AttachmentResponse> list(Long requestId, User caller) {
        serviceRequestService.getOwnedOrThrow(requestId, caller);
        return attachmentRepository.findByRequestId(requestId).stream().map(this::toResponse).toList();
    }

    public AttachmentResponse updateNote(Long requestId, Long attachmentId, Long callerUserId, AttachmentNoteUpdateRequest body) {
        serviceRequestService.getOwnedOrThrow(requestId, callerUserId);
        RequestAttachment attachment = attachmentRepository.findByIdAndRequestId(attachmentId, requestId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("RequestAttachment", attachmentId));
        attachment.setNote(body.note());
        return toResponse(attachmentRepository.save(attachment));
    }

    public void delete(Long requestId, Long attachmentId, Long callerUserId) {
        ServiceRequest request = serviceRequestService.getOwnedOrThrow(requestId, callerUserId);
        if (request.getExecutionStatus() != RequestStatus.DRAFT) {
            throw new ConflictException("Attachments can only be removed while the request is still a draft");
        }
        RequestAttachment attachment = attachmentRepository.findByIdAndRequestId(attachmentId, requestId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("RequestAttachment", attachmentId));
        try {
            s3Service.deleteObject(attachment.getS3Key());
        } catch (Exception ignored) {
        }
        attachmentRepository.delete(attachment);
    }

    private AttachmentResponse toResponse(RequestAttachment a) {
        return new AttachmentResponse(
                a.getId(),
                a.getCategory(),
                s3Service.publicUrl(a.getS3Key()),
                a.getNote(),
                a.getOriginalFileName(),
                a.getUploadedAt()
        );
    }
}
