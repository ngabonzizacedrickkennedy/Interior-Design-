package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiAttachmentPayload(
        @JsonProperty("category") String category,
        @JsonProperty("url") String url,
        @JsonProperty("note") String note
) {}
