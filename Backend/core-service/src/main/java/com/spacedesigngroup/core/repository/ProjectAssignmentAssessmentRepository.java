package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.ProjectAssignmentAssessment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectAssignmentAssessmentRepository extends JpaRepository<ProjectAssignmentAssessment, Long> {

    List<ProjectAssignmentAssessment> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
