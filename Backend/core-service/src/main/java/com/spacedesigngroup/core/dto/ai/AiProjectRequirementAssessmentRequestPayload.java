package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public record AiProjectRequirementAssessmentRequestPayload(
        @JsonProperty("room_type") String roomType,
        @JsonProperty("request_details") String requestDetails,
        @JsonProperty("budget_min") BigDecimal budgetMin,
        @JsonProperty("budget_max") BigDecimal budgetMax,
        @JsonProperty("style_tags") List<String> styleTags,
        @JsonProperty("timeline") String timeline,
        @JsonProperty("length_m") BigDecimal lengthM,
        @JsonProperty("width_m") BigDecimal widthM,
        @JsonProperty("ceiling_height_m") BigDecimal ceilingHeightM
) {}
