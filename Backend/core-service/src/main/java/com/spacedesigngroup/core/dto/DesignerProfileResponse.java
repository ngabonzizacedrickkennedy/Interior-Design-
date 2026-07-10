package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.DocumentStatus;

import java.time.LocalDateTime;

public record DesignerProfileResponse(
        Long id,
        Long userId,
        String fullName,
        String email,
        String cvFileUrl,
        String cvOriginalFilename,
        String githubUrl,
        String portfolioUrl,
        String otherLinkUrl,
        Boolean cvIsValidDocument,
        Integer cvStrengthScore,
        String cvReasoning,
        LocalDateTime cvAnalyzedAt,
        Integer interviewScore,
        String interviewReasoning,
        String capabilitySummaryCache,
        DocumentStatus approvalStatus,
        Integer profileCompletionPercent,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
