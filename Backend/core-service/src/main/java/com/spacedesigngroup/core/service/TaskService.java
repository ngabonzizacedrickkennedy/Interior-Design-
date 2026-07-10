package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.AssignableMemberResponse;
import com.spacedesigngroup.core.dto.NotificationRequest;
import com.spacedesigngroup.core.dto.ProjectResponse;
import com.spacedesigngroup.core.dto.TaskRequest;
import com.spacedesigngroup.core.dto.TaskResponse;
import com.spacedesigngroup.core.model.DispatchChannel;
import com.spacedesigngroup.core.model.ProjectAssignmentType;
import com.spacedesigngroup.core.model.ProjectRecord;
import com.spacedesigngroup.core.model.StaffInvitationStatus;
import com.spacedesigngroup.core.model.TaskAssignment;
import com.spacedesigngroup.core.repository.ProjectRepository;
import com.spacedesigngroup.core.repository.StaffMembershipRepository;
import com.spacedesigngroup.core.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final StaffMembershipRepository staffMembershipRepository;
    private final ProjectService projectService;
    private final NotificationService notificationService;

    public List<TaskResponse> findAll() {
        return taskRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<TaskResponse> findByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream().map(this::toResponse).toList();
    }

    public List<TaskResponse> findByDesigner(Long designerId) {
        return taskRepository.findByAssignedDesignerId(designerId).stream().map(this::toResponse).toList();
    }

    public List<TaskResponse> findOverdue() {
        return taskRepository.findByIsCompletedFalseAndDeadlineDateBefore(LocalDate.now())
                .stream().map(this::toResponse).toList();
    }

    public TaskResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public List<ProjectResponse> findAssignableProjects() {
        return projectService.findAssigned();
    }

    public List<AssignableMemberResponse> findAssignableMembers(Long projectId) {
        ProjectRecord project = projectRepository.findById(projectId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("ProjectRecord", projectId));

        if (project.getAssignmentType() == ProjectAssignmentType.INDIVIDUAL && project.getAssignedDesigner() != null) {
            return List.of(new AssignableMemberResponse(
                    project.getAssignedDesigner().getId(), project.getAssignedDesigner().getFullName()));
        }
        if (project.getAssignmentType() == ProjectAssignmentType.STAFF && project.getAssignedStaff() != null) {
            return staffMembershipRepository
                    .findByStaffIdAndInvitationStatus(project.getAssignedStaff().getId(), StaffInvitationStatus.ACCEPTED)
                    .stream()
                    .map(m -> new AssignableMemberResponse(m.getMember().getId(), m.getMember().getFullName()))
                    .toList();
        }
        return List.of();
    }

    public TaskResponse create(TaskRequest request) {
        ProjectRecord project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> ResourceNotFoundException.forEntity("ProjectRecord", request.projectId()));

        User designer;
        if (project.getAssignmentType() == ProjectAssignmentType.INDIVIDUAL) {
            designer = project.getAssignedDesigner();
        } else if (project.getAssignmentType() == ProjectAssignmentType.STAFF) {
            if (request.assignedDesignerId() == null) {
                throw new IllegalArgumentException("assignedDesignerId is required for tasks on a staff-assigned project");
            }
            boolean isAcceptedMember = staffMembershipRepository
                    .findByStaffIdAndMemberId(project.getAssignedStaff().getId(), request.assignedDesignerId())
                    .filter(m -> m.getInvitationStatus() == StaffInvitationStatus.ACCEPTED)
                    .isPresent();
            if (!isAcceptedMember) {
                throw new IllegalArgumentException("The selected designer is not an accepted member of this project's staff team");
            }
            designer = userRepository.findById(request.assignedDesignerId())
                    .orElseThrow(() -> ResourceNotFoundException.forEntity("User", request.assignedDesignerId()));
        } else {
            throw new ConflictException("This project is not yet assigned to anyone");
        }

        TaskAssignment task = TaskAssignment.builder()
                .project(project)
                .taskTitle(request.taskTitle())
                .assignedDesigner(designer)
                .deadlineDate(request.deadlineDate())
                .isCompleted(false)
                .build();
        TaskAssignment saved = taskRepository.save(task);

        if (designer != null) {
            notificationService.send(new NotificationRequest(designer.getId(), DispatchChannel.IN_APP,
                    "You have been assigned a new task: " + request.taskTitle() + "."));
        }

        return toResponse(saved);
    }

    public TaskResponse toggleCompletion(Long id) {
        TaskAssignment task = getOrThrow(id);
        task.setIsCompleted(!task.getIsCompleted());
        return toResponse(taskRepository.save(task));
    }

    public void delete(Long id) {
        taskRepository.delete(getOrThrow(id));
    }

    private TaskAssignment getOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("TaskAssignment", id));
    }

    private TaskResponse toResponse(TaskAssignment t) {
        return new TaskResponse(
                t.getId(), t.getProject().getId(), resolveProjectName(t.getProject()), t.getTaskTitle(),
                t.getAssignedDesigner() != null ? t.getAssignedDesigner().getId() : null,
                t.getAssignedDesigner() != null ? t.getAssignedDesigner().getFullName() : null,
                t.getDeadlineDate(), t.getIsCompleted()
        );
    }

    private String resolveProjectName(ProjectRecord project) {
        var request = project.getRequest();
        if (request == null) return null;
        return request.getRequestName() != null && !request.getRequestName().isBlank()
                ? request.getRequestName() : request.getRoomType();
    }
}
