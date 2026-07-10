package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.RecommendedAssignmentMode;

import java.time.LocalDateTime;

public record ProjectAssignmentAssessmentResponse(
        Long id,
        RecommendedAssignmentMode recommendedMode,
        Integer complexityScore,
        String reasoning,
        LocalDateTime createdAt
) {}
