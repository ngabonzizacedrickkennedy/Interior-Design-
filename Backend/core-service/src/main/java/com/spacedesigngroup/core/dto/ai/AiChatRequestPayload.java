package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AiChatRequestPayload(
        @JsonProperty("message") String message,
        @JsonProperty("history") List<AiChatMessagePayload> history
) {}
