package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiStageRequestPayload(
        @JsonProperty("image_url") String imageUrl,
        @JsonProperty("style") String style,
        @JsonProperty("room_type") String roomType
) {}
