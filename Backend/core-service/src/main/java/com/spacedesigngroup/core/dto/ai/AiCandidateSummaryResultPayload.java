package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiCandidateSummaryResultPayload(
        @JsonProperty("summary") String summary
) {}
