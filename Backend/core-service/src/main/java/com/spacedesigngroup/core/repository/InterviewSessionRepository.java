package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.InterviewSession;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    List<InterviewSession> findByDesignerProfileIdOrderByCreatedAtDesc(Long designerProfileId);
}
