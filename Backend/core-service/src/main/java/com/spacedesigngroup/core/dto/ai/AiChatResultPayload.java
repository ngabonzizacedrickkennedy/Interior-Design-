package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiChatResultPayload(
        @JsonProperty("reply") String reply
) {}
