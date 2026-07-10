package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiLightingPayload(
        @JsonProperty("window_direction") String windowDirection,
        @JsonProperty("natural_light_level") String naturalLightLevel,
        @JsonProperty("artificial_lighting_notes") String artificialLightingNotes
) {}
