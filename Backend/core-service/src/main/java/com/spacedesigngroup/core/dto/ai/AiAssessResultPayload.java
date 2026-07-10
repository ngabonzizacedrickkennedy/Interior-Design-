package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record AiAssessResultPayload(
        @JsonProperty("verdict") String verdict,
        @JsonProperty("recommended_budget_min") BigDecimal recommendedBudgetMin,
        @JsonProperty("recommended_budget_max") BigDecimal recommendedBudgetMax,
        @JsonProperty("reasoning") String reasoning,
        @JsonProperty("style_summary") String styleSummary,
        @JsonProperty("room_condition_summary") String roomConditionSummary
) {}
