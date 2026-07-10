package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.AiAssessment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiAssessmentRepository extends JpaRepository<AiAssessment, Long> {

    List<AiAssessment> findByRequestIdOrderByCreatedAtDesc(Long requestId);

    Optional<AiAssessment> findFirstByRequestIdOrderByCreatedAtDesc(Long requestId);

    Optional<AiAssessment> findByIdAndRequestId(Long id, Long requestId);
}
