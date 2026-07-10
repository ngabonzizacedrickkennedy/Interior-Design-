package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiInterviewQuestionsRequestPayload(
        @JsonProperty("cv_url") String cvUrl
) {}
