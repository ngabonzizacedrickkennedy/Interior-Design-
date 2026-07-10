package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public record AiAssessRequestPayload(
        @JsonProperty("request_id") Long requestId,
        @JsonProperty("room_type") String roomType,
        @JsonProperty("request_details") String requestDetails,
        @JsonProperty("dimensions") AiDimensionsPayload dimensions,
        @JsonProperty("budget_min") BigDecimal budgetMin,
        @JsonProperty("budget_max") BigDecimal budgetMax,
        @JsonProperty("style_tags") List<String> styleTags,
        @JsonProperty("space_usage") AiSpaceUsagePayload spaceUsage,
        @JsonProperty("lighting") AiLightingPayload lighting,
        @JsonProperty("timeline") String timeline,
        @JsonProperty("avoid_notes") String avoidNotes,
        @JsonProperty("sourcing_location") String sourcingLocation,
        @JsonProperty("attachments") List<AiAttachmentPayload> attachments
) {}
