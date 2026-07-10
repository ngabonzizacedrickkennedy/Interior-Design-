package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiChatMessagePayload(
        @JsonProperty("role") String role,
        @JsonProperty("content") String content
) {}
