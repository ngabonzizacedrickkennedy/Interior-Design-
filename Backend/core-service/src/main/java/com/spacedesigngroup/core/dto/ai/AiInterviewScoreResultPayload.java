package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiInterviewScoreResultPayload(
        @JsonProperty("score") Integer score,
        @JsonProperty("reasoning") String reasoning
) {}
