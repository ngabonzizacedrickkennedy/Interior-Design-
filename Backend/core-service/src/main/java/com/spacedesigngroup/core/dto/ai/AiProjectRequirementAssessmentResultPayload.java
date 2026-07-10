package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiProjectRequirementAssessmentResultPayload(
        @JsonProperty("recommended_mode") String recommendedMode,
        @JsonProperty("complexity_score") Integer complexityScore,
        @JsonProperty("reasoning") String reasoning
) {}
