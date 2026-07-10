package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiStageResultPayload(
        @JsonProperty("image_base64") String imageBase64
) {}
