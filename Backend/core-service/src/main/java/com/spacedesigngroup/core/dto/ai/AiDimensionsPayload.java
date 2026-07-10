package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record AiDimensionsPayload(
        @JsonProperty("length_m") BigDecimal lengthM,
        @JsonProperty("width_m") BigDecimal widthM,
        @JsonProperty("ceiling_height_m") BigDecimal ceilingHeightM,
        @JsonProperty("spatial_notes") String spatialNotes
) {}
