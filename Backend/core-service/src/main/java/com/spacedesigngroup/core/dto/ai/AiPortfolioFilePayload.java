package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiPortfolioFilePayload(
        @JsonProperty("url") String url
) {}
