package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiCvAnalyzeResultPayload(
        @JsonProperty("is_cv") boolean isCv,
        @JsonProperty("strength_score") Integer strengthScore,
        @JsonProperty("reasoning") String reasoning
) {}
