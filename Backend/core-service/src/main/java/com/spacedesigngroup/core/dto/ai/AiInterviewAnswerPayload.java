package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiInterviewAnswerPayload(
        @JsonProperty("question") String question,
        @JsonProperty("answer") String answer
) {}
