package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.PortfolioTaskRecommendation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioTaskRecommendationRepository extends JpaRepository<PortfolioTaskRecommendation, Long> {

    List<PortfolioTaskRecommendation> findByDocumentIdOrderByCreatedAtDesc(Long documentId);
}
