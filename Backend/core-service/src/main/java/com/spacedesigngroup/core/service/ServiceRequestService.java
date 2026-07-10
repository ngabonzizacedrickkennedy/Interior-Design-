package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.*;
import com.spacedesigngroup.core.model.AiAssessment;
import com.spacedesigngroup.core.model.AttachmentCategory;
import com.spacedesigngroup.core.model.Client;
import com.spacedesigngroup.core.model.InvestmentStatus;
import com.spacedesigngroup.core.model.RequestAttachment;
import com.spacedesigngroup.core.model.RequestStatus;
import com.spacedesigngroup.core.model.ServiceRequest;
import com.spacedesigngroup.core.repository.AiAssessmentRepository;
import com.spacedesigngroup.core.repository.ClientRepository;
import com.spacedesigngroup.core.repository.RequestAttachmentRepository;
import com.spacedesigngroup.core.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final RequestAttachmentRepository attachmentRepository;
    private final AiAssessmentRepository assessmentRepository;
    private final S3Service s3Service;
    private final AutoQuotationTriggerService autoQuotationTriggerService;

    public List<ServiceRequestResponse> findAll() {
        return requestRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<ServiceRequestResponse> findByClient(Long clientId) {
        return requestRepository.findByClientId(clientId).stream().map(this::toResponse).toList();
    }

    public List<ServiceRequestResponse> findByStaff(Long staffId) {
        return requestRepository.findByAssignedStaffId(staffId).stream().map(this::toResponse).toList();
    }

    public List<ServiceRequestResponse> findMine(Long callerUserId) {
        Client caller = requireClientByUserId(callerUserId);
        return requestRepository.findByClientId(caller.getId()).stream().map(this::toResponse).toList();
    }

    public ServiceRequestResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public ServiceRequestResponse create(ServiceRequestRequest request) {
        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Client", request.clientId()));
        ServiceRequest entity = ServiceRequest.builder()
                .client(client)
                .requestDetails(request.requestDetails())
                .budgetLimit(request.budgetLimit())
                .executionStatus(RequestStatus.NEW)
                .build();
        return toResponse(requestRepository.save(entity));
    }

    public ServiceRequestResponse createDraft(Long callerUserId) {
        Client client = requireClientByUserId(callerUserId);
        ServiceRequest entity = ServiceRequest.builder()
                .client(client)
                .requestDetails("")
                .budgetLimit(java.math.BigDecimal.ZERO)
                .executionStatus(RequestStatus.DRAFT)
                .build();
        return toResponse(requestRepository.save(entity));
    }

    public ServiceRequestResponse updateDraft(Long id, Long callerUserId, RequestWizardRequest body) {
        ServiceRequest entity = getOwnedOrThrow(id, callerUserId);
        if (entity.getExecutionStatus() != RequestStatus.DRAFT) {
            throw new ConflictException("Only a draft request can be edited");
        }
        applyWizardFields(entity, body);
        return toResponse(requestRepository.save(entity));
    }

    private void applyWizardFields(ServiceRequest entity, RequestWizardRequest body) {
        if (body.requestName() != null) entity.setRequestName(body.requestName());
        if (body.roomType() != null) entity.setRoomType(body.roomType());
        if (body.requestDetails() != null) entity.setRequestDetails(body.requestDetails());
        if (body.lengthMeters() != null) entity.setLengthMeters(body.lengthMeters());
        if (body.widthMeters() != null) entity.setWidthMeters(body.widthMeters());
        if (body.ceilingHeightMeters() != null) entity.setCeilingHeightMeters(body.ceilingHeightMeters());
        if (body.spatialNotes() != null) entity.setSpatialNotes(body.spatialNotes());
        if (body.budgetMin() != null) entity.setBudgetMin(body.budgetMin());
        if (body.budgetMax() != null) entity.setBudgetMax(body.budgetMax());
        if (body.styleTags() != null) entity.setStyleTags(body.styleTags());
        if (body.worksFromHome() != null) entity.setWorksFromHome(body.worksFromHome());
        if (body.entertainsOften() != null) entity.setEntertainsOften(body.entertainsOften());
        if (body.hasKids() != null) entity.setHasKids(body.hasKids());
        if (body.hasPets() != null) entity.setHasPets(body.hasPets());
        if (body.storageNeeds() != null) entity.setStorageNeeds(body.storageNeeds());
        if (body.windowDirection() != null) entity.setWindowDirection(body.windowDirection());
        if (body.naturalLightLevel() != null) entity.setNaturalLightLevel(body.naturalLightLevel());
        if (body.artificialLightingNotes() != null) entity.setArtificialLightingNotes(body.artificialLightingNotes());
        if (body.timeline() != null) entity.setTimeline(body.timeline());
        if (body.avoidNotes() != null) entity.setAvoidNotes(body.avoidNotes());
        if (body.sourcingLocation() != null) entity.setSourcingLocation(body.sourcingLocation());
    }

    public ServiceRequestResponse submit(Long id, Long callerUserId) {
        ServiceRequest entity = getOwnedOrThrow(id, callerUserId);
        if (entity.getExecutionStatus() != RequestStatus.DRAFT) {
            throw new ConflictException("Request has already been submitted");
        }
        boolean hasRoomPhoto = attachmentRepository.countByRequestIdAndCategory(id, AttachmentCategory.ROOM_PHOTO) > 0;
        if (!hasRoomPhoto) {
            throw new IllegalArgumentException("At least one room photo is required before submitting");
        }
        if (entity.getLengthMeters() == null || entity.getWidthMeters() == null || entity.getCeilingHeightMeters() == null) {
            throw new IllegalArgumentException("Room dimensions are required before submitting");
        }
        if (entity.getBudgetMin() == null || entity.getBudgetMax() == null) {
            throw new IllegalArgumentException("A budget range is required before submitting");
        }
        if (entity.getTimeline() == null) {
            throw new IllegalArgumentException("A timeline is required before submitting");
        }
        if (entity.getRequestDetails() == null || entity.getRequestDetails().isBlank()) {
            throw new IllegalArgumentException("A description of the request is required before submitting");
        }

        entity.setBudgetLimit(entity.getBudgetMax());
        entity.setExecutionStatus(RequestStatus.NEW);
        ServiceRequest saved = requestRepository.save(entity);
        triggerAutoAssessmentAndQuotation(saved);
        return toResponse(saved);
    }

    private void triggerAutoAssessmentAndQuotation(ServiceRequest request) {
        try {
            autoQuotationTriggerService.runFor(request.getId());
        } catch (Exception ignored) {
        }
    }

    public void withdraw(Long id, Long callerUserId) {
        ServiceRequest entity = getOwnedOrThrow(id, callerUserId);
        if (entity.getExecutionStatus() != RequestStatus.DRAFT && entity.getExecutionStatus() != RequestStatus.NEW) {
            throw new ConflictException("Only a draft or newly submitted request can be withdrawn");
        }
        if (entity.getInvestmentStatus() == InvestmentStatus.INVESTED) {
            throw new ConflictException("An invested request cannot be withdrawn");
        }
        for (RequestAttachment attachment : entity.getAttachments()) {
            try {
                s3Service.deleteObject(attachment.getS3Key());
            } catch (Exception ignored) {
            }
        }
        requestRepository.delete(entity);
    }

    public Client requireClientByUserId(Long userId) {
        return clientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No client profile found for the current user"));
    }

    public ServiceRequest getOwnedOrThrow(Long requestId, Long callerUserId) {
        ServiceRequest entity = getOrThrow(requestId);
        Client caller = requireClientByUserId(callerUserId);
        if (!entity.getClient().getId().equals(caller.getId())) {
            throw new ConflictException("You do not have access to this request");
        }
        return entity;
    }

    public ServiceRequest getOwnedOrThrow(Long requestId, User caller) {
        if (caller.getRole() == com.spacedesigngroup.core.auth.Role.CLIENT) {
            return getOwnedOrThrow(requestId, caller.getId());
        }
        return getOrThrow(requestId);
    }

    public ServiceRequestResponse assignStaff(Long id, AssignStaffRequest request) {
        ServiceRequest entity = getOrThrow(id);
        User staff = userRepository.findById(request.staffId())
                .orElseThrow(() -> ResourceNotFoundException.forEntity("User", request.staffId()));
        entity.setAssignedStaff(staff);
        if (entity.getExecutionStatus() == RequestStatus.NEW) {
            entity.setExecutionStatus(RequestStatus.IN_REVIEW);
        }
        return toResponse(requestRepository.save(entity));
    }

    public ServiceRequestResponse updateStatus(Long id, StatusUpdateRequest request) {
        ServiceRequest entity = getOrThrow(id);
        entity.setExecutionStatus(request.executionStatus());
        return toResponse(requestRepository.save(entity));
    }

    public void delete(Long id) {
        requestRepository.delete(getOrThrow(id));
    }

    public ServiceRequest getOrThrow(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("ServiceRequest", id));
    }

    public ServiceRequestResponse toResponseById(Long id) {
        return toResponse(getOrThrow(id));
    }

    private ServiceRequestResponse toResponse(ServiceRequest r) {
        List<AttachmentResponse> attachments = attachmentRepository.findByRequestId(r.getId()).stream()
                .map(a -> new AttachmentResponse(
                        a.getId(),
                        a.getCategory(),
                        s3Service.publicUrl(a.getS3Key()),
                        a.getNote(),
                        a.getOriginalFileName(),
                        a.getUploadedAt()
                ))
                .toList();

        AiAssessment latest = assessmentRepository.findFirstByRequestIdOrderByCreatedAtDesc(r.getId()).orElse(null);
        AiAssessmentResponse latestAssessment = latest == null ? null : new AiAssessmentResponse(
                latest.getId(),
                r.getId(),
                latest.getVerdict(),
                latest.getRecommendedBudgetMin(),
                latest.getRecommendedBudgetMax(),
                latest.getReasoning(),
                latest.getStyleSummary(),
                latest.getRoomConditionSummary(),
                latest.getStatus(),
                latest.isSystemTriggered(),
                latest.getCreatedAt()
        );

        return new ServiceRequestResponse(
                r.getId(),
                r.getClient().getId(),
                r.getClient().getContactName(),
                r.getRequestDetails(),
                r.getBudgetLimit(),
                r.getExecutionStatus(),
                r.getAssignedStaff() != null ? r.getAssignedStaff().getId() : null,
                r.getAssignedStaff() != null ? r.getAssignedStaff().getFullName() : null,
                r.getRequestName(),
                r.getRoomType(),
                r.getLengthMeters(),
                r.getWidthMeters(),
                r.getCeilingHeightMeters(),
                r.getSpatialNotes(),
                r.getBudgetMin(),
                r.getBudgetMax(),
                new java.util.ArrayList<>(r.getStyleTags()),
                r.isWorksFromHome(),
                r.isEntertainsOften(),
                r.isHasKids(),
                r.isHasPets(),
                r.getStorageNeeds(),
                r.getWindowDirection(),
                r.getNaturalLightLevel(),
                r.getArtificialLightingNotes(),
                r.getTimeline(),
                r.getAvoidNotes(),
                r.getSourcingLocation(),
                r.getInvestmentStatus(),
                r.getInvestedAmount(),
                r.getInvestedAt(),
                attachments.stream()
                        .sorted(Comparator.comparing(AttachmentResponse::uploadedAt))
                        .toList(),
                latestAssessment
        );
    }
}
