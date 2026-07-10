package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.auth.Role;
import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.model.DesignerLedgerTransactionType;
import com.spacedesigngroup.core.model.ProjectAssignmentAssessment;
import com.spacedesigngroup.core.model.ProjectAssignmentType;
import com.spacedesigngroup.core.model.ProjectRecord;
import com.spacedesigngroup.core.model.MilestoneItem;
import com.spacedesigngroup.core.model.ProjectStatus;
import com.spacedesigngroup.core.model.RecommendedAssignmentMode;
import com.spacedesigngroup.core.model.ServiceRequest;
import com.spacedesigngroup.core.model.Staff;
import com.spacedesigngroup.core.model.StaffInvitationStatus;
import com.spacedesigngroup.core.model.StaffLedgerTransaction;
import com.spacedesigngroup.core.model.StaffLedgerTransactionType;
import com.spacedesigngroup.core.model.DispatchChannel;
import com.spacedesigngroup.core.model.DocumentStatus;
import com.spacedesigngroup.core.repository.DesignDocumentRepository;
import com.spacedesigngroup.core.repository.ProjectAssignmentAssessmentRepository;
import com.spacedesigngroup.core.repository.ProjectRepository;
import com.spacedesigngroup.core.repository.StaffLedgerTransactionRepository;
import com.spacedesigngroup.core.repository.StaffMembershipRepository;
import com.spacedesigngroup.core.repository.StaffRepository;

import java.math.BigDecimal;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.*;
import com.spacedesigngroup.core.dto.ai.AiProjectRequirementAssessmentRequestPayload;
import com.spacedesigngroup.core.dto.ai.AiProjectRequirementAssessmentResultPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ObjectMapper objectMapper;
    private final ProjectAssignmentAssessmentRepository assignmentAssessmentRepository;
    private final StaffRepository staffRepository;
    private final StaffMembershipRepository staffMembershipRepository;
    private final StaffLedgerTransactionRepository staffLedgerTransactionRepository;
    private final UserRepository userRepository;
    private final AiServiceClient aiServiceClient;
    private final NotificationService notificationService;
    private final DesignerWalletService designerWalletService;
    private final DesignDocumentRepository designDocumentRepository;

    public List<ProjectResponse> findAll() {
        return projectRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<ProjectResponse> findByClient(Long clientId) {
        return projectRepository.findByClientId(clientId).stream().map(this::toResponse).toList();
    }

    public List<ProjectResponse> findByAssignedStaff(Long staffId) {
        return projectRepository.findByAssignedStaffId(staffId).stream().map(this::toResponse).toList();
    }

    public List<ProjectResponse> findByAssignedDesigner(Long userId) {
        return projectRepository.findByAssignedDesignerId(userId).stream().map(this::toResponse).toList();
    }

    public List<ProjectResponse> findMine(Long userId) {
        List<ProjectRecord> individual = projectRepository.findByAssignedDesignerId(userId);

        List<Long> myStaffIds = staffMembershipRepository
                .findByMemberIdAndInvitationStatus(userId, StaffInvitationStatus.ACCEPTED)
                .stream().map(m -> m.getStaff().getId()).toList();
        List<ProjectRecord> viaStaff = myStaffIds.isEmpty()
                ? Collections.emptyList()
                : projectRepository.findByAssignedStaffIdIn(myStaffIds);

        return java.util.stream.Stream.concat(individual.stream(), viaStaff.stream())
                .collect(java.util.stream.Collectors.toMap(ProjectRecord::getId, p -> p, (a, b) -> a))
                .values().stream().map(this::toResponse).toList();
    }

    public ProjectResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public ProjectResponse updateMilestones(Long id, MilestoneUpdateRequest request, User caller) {
        ProjectRecord project = getOrThrow(id);
        if (caller.getRole() == Role.STAFF) {
            assertDesignerOwnsProject(project, caller.getId());
        }
        project.setMilestoneChecklistJson(toJson(request.milestones()));
        recalculateProgress(project, request.milestones());
        return toResponse(projectRepository.save(project));
    }

    private void assertDesignerOwnsProject(ProjectRecord project, Long userId) {
        boolean isIndividualOwner = project.getAssignedDesigner() != null
                && project.getAssignedDesigner().getId().equals(userId);
        boolean isStaffTeamMember = project.getAssignedStaff() != null
                && staffMembershipRepository.findByStaffIdAndMemberId(project.getAssignedStaff().getId(), userId)
                        .filter(m -> m.getInvitationStatus() == StaffInvitationStatus.ACCEPTED)
                        .isPresent();
        if (!isIndividualOwner && !isStaffTeamMember) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not assigned to this project.");
        }
    }

    public ProjectResponse updateStatus(Long id, ProjectStatusUpdateRequest request) {
        ProjectRecord project = getOrThrow(id);
        project.setOperationalStatus(request.operationalStatus());
        return toResponse(projectRepository.save(project));
    }

    public List<ProjectResponse> findAssigned() {
        return projectRepository.findAllAssigned().stream().map(this::toResponse).toList();
    }

    public List<ProjectResponse> findUnassigned() {
        return projectRepository.findByAssignmentType(ProjectAssignmentType.UNASSIGNED).stream()
                .map(this::toResponse).toList();
    }

    public ProjectAssignmentAssessmentResponse assessRequirement(Long projectId) {
        ProjectRecord project = getOrThrow(projectId);
        ServiceRequest request = project.getRequest();
        if (request == null) {
            throw new ConflictException("This project has no linked request to assess");
        }

        AiProjectRequirementAssessmentResultPayload result = aiServiceClient.assessProjectRequirement(
                new AiProjectRequirementAssessmentRequestPayload(
                        request.getRoomType(),
                        request.getRequestDetails(),
                        request.getBudgetMin(),
                        request.getBudgetMax(),
                        request.getStyleTags().stream().map(Enum::name).toList(),
                        request.getTimeline() != null ? request.getTimeline().name() : null,
                        request.getLengthMeters(),
                        request.getWidthMeters(),
                        request.getCeilingHeightMeters()
                ));

        ProjectAssignmentAssessment saved = assignmentAssessmentRepository.save(ProjectAssignmentAssessment.builder()
                .project(project)
                .recommendedMode(RecommendedAssignmentMode.valueOf(result.recommendedMode()))
                .complexityScore(result.complexityScore())
                .reasoning(result.reasoning())
                .build());

        return new ProjectAssignmentAssessmentResponse(saved.getId(), saved.getRecommendedMode(),
                saved.getComplexityScore(), saved.getReasoning(), saved.getCreatedAt());
    }

    public ProjectResponse assign(Long projectId, ProjectAssignRequest request) {
        ProjectRecord project = getOrThrow(projectId);

        if (request.assignmentType() == ProjectAssignmentType.INDIVIDUAL) {
            if (request.designerUserId() == null) {
                throw new IllegalArgumentException("designerUserId is required for individual assignment");
            }
            User designer = userRepository.findById(request.designerUserId())
                    .orElseThrow(() -> ResourceNotFoundException.forEntity("User", request.designerUserId()));

            project.setAssignedDesigner(designer);
            project.setAssignedStaff(null);
            project.setAssignmentType(ProjectAssignmentType.INDIVIDUAL);
            project.setAssignedAt(LocalDateTime.now());
            projectRepository.save(project);

            notificationService.send(new NotificationRequest(designer.getId(), DispatchChannel.IN_APP,
                    "You have been assigned a new project: " + resolveRequestName(project) + "."));

        } else if (request.assignmentType() == ProjectAssignmentType.STAFF) {
            if (request.staffId() == null) {
                throw new IllegalArgumentException("staffId is required for staff assignment");
            }
            Staff staff = staffRepository.findById(request.staffId())
                    .orElseThrow(() -> ResourceNotFoundException.forEntity("Staff", request.staffId()));

            project.setAssignedStaff(staff);
            project.setAssignedDesigner(null);
            project.setAssignmentType(ProjectAssignmentType.STAFF);
            project.setAssignedAt(LocalDateTime.now());
            projectRepository.save(project);

            staffMembershipRepository.findByStaffIdAndInvitationStatus(staff.getId(), StaffInvitationStatus.ACCEPTED)
                    .forEach(m -> notificationService.send(new NotificationRequest(m.getMember().getId(), DispatchChannel.IN_APP,
                            "Your staff team \"" + staff.getName() + "\" has been assigned a new project: " + resolveRequestName(project) + ".")));
        } else {
            throw new IllegalArgumentException("assignmentType must be INDIVIDUAL or STAFF");
        }

        return toResponse(project);
    }

    public BigDecimal blockedInSystemAmount() {
        return projectRepository.sumBlockedInSystem();
    }

    public ProjectResponse compensate(Long projectId) {
        ProjectRecord project = getOrThrow(projectId);
        if (project.getOperationalStatus() != ProjectStatus.COMPLETED) {
            throw new ConflictException("Only completed projects can be compensated");
        }
        if (project.getCompensatedAt() != null) {
            throw new ConflictException("This project has already been compensated");
        }
        boolean hasApprovedProof = designDocumentRepository.findByProjectId(projectId).stream()
                .anyMatch(doc -> doc.getApprovalBadgeStatus() == DocumentStatus.APPROVED);
        if (!hasApprovedProof) {
            throw new ConflictException(
                    "Cannot release payment yet — approve at least one design file as proof of completed work first.");
        }

        ServiceRequest request = project.getRequest();
        BigDecimal amount = request != null ? request.getInvestedAmount() : null;
        if (amount == null) {
            throw new ConflictException("This project has no invested amount to release");
        }

        if (project.getAssignmentType() == ProjectAssignmentType.INDIVIDUAL && project.getAssignedDesigner() != null) {
            designerWalletService.creditAssignedBalance(project.getAssignedDesigner().getId(), amount,
                    DesignerLedgerTransactionType.COMPENSATION, project, null);
            notificationService.send(new NotificationRequest(project.getAssignedDesigner().getId(), DispatchChannel.IN_APP,
                    "Compensation of " + amount + " has been released for \"" + resolveRequestName(project) + "\"."));
        } else if (project.getAssignmentType() == ProjectAssignmentType.STAFF && project.getAssignedStaff() != null) {
            Staff staff = project.getAssignedStaff();
            staff.setAssignedBalance(staff.getAssignedBalance().add(amount));
            staffRepository.save(staff);
            staffLedgerTransactionRepository.save(StaffLedgerTransaction.builder()
                    .staff(staff)
                    .type(StaffLedgerTransactionType.COMPENSATION_CREDIT)
                    .amount(amount)
                    .relatedProject(project)
                    .balanceAfter(staff.getAssignedBalance())
                    .build());
            staffMembershipRepository.findByStaffIdAndInvitationStatus(staff.getId(), StaffInvitationStatus.ACCEPTED)
                    .forEach(m -> notificationService.send(new NotificationRequest(m.getMember().getId(), DispatchChannel.IN_APP,
                            "Compensation of " + amount + " has been released to \"" + staff.getName()
                                    + "\" for \"" + resolveRequestName(project) + "\".")));
        } else {
            throw new ConflictException("This project is not assigned to anyone");
        }

        project.setCompensatedAt(LocalDateTime.now());
        return toResponse(projectRepository.save(project));
    }

    private String resolveRequestName(ProjectRecord project) {
        var request = project.getRequest();
        if (request == null) return "a project";
        return request.getRequestName() != null && !request.getRequestName().isBlank()
                ? request.getRequestName() : request.getRoomType();
    }

    public void markReadyIfFunded(Long requestId) {
        projectRepository.findByRequestId(requestId).ifPresent(project -> {
            if (project.getOperationalStatus() == ProjectStatus.PENDING) {
                project.setOperationalStatus(ProjectStatus.READY);
                projectRepository.save(project);
            }
        });
    }

    private void recalculateProgress(ProjectRecord project, List<MilestoneItem> milestones) {
        if (milestones.isEmpty()) {
            project.setVisualProgressPercent(0);
            return;
        }
        long achieved = milestones.stream().filter(MilestoneItem::isAchieved).count();
        int percent = (int) Math.round(100.0 * achieved / milestones.size());
        project.setVisualProgressPercent(percent);
        if (percent == 100) {
            project.setOperationalStatus(ProjectStatus.COMPLETED);
        } else if (percent > 0) {
            project.setOperationalStatus(ProjectStatus.ACTIVE);
        }
    }

    public ProjectRecord getOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("ProjectRecord", id));
    }

    private ProjectResponse toResponse(ProjectRecord p) {
        var request = p.getRequest();
        String requestName = request == null ? null
                : request.getRequestName() != null && !request.getRequestName().isBlank()
                        ? request.getRequestName() : request.getRoomType();
        return new ProjectResponse(
                p.getId(),
                p.getClient().getId(),
                p.getClient().getContactName(),
                request == null ? null : request.getId(),
                requestName,
                parseMilestones(p.getMilestoneChecklistJson()),
                p.getVisualProgressPercent(),
                p.getOperationalStatus(),
                p.getAssignmentType(),
                p.getAssignedDesigner() != null ? p.getAssignedDesigner().getId() : null,
                p.getAssignedDesigner() != null ? p.getAssignedDesigner().getFullName() : null,
                p.getAssignedStaff() != null ? p.getAssignedStaff().getId() : null,
                p.getAssignedStaff() != null ? p.getAssignedStaff().getName() : null,
                p.getAssignedAt(),
                p.getCompensatedAt(),
                request == null ? null : request.getInvestedAmount()
        );
    }

    private List<MilestoneItem> parseMilestones(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private String toJson(List<MilestoneItem> milestones) {
        try {
            return objectMapper.writeValueAsString(milestones);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }
}
