package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.StagedVisualization;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StagedVisualizationRepository extends JpaRepository<StagedVisualization, Long> {

    List<StagedVisualization> findByRequestIdOrderByCreatedAtDesc(Long requestId);
}
