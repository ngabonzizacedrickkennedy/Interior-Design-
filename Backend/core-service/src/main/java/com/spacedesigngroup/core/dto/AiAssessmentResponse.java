package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.AssessmentAcknowledgement;
import com.spacedesigngroup.core.model.AssessmentVerdict;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AiAssessmentResponse(
        Long id,
        Long requestId,
        AssessmentVerdict verdict,
        BigDecimal recommendedBudgetMin,
        BigDecimal recommendedBudgetMax,
        String reasoning,
        String styleSummary,
        String roomConditionSummary,
        AssessmentAcknowledgement status,
        boolean systemTriggered,
        LocalDateTime createdAt
) {}
