package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.TaskAssignment;


import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<TaskAssignment, Long> {

    List<TaskAssignment> findByProjectId(Long projectId);

    List<TaskAssignment> findByAssignedDesignerId(Long designerId);

    List<TaskAssignment> findByIsCompletedFalseAndDeadlineDateBefore(LocalDate date);
}
