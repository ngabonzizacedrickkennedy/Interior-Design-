package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AiInterviewQuestionsResultPayload(
        @JsonProperty("questions") List<String> questions
) {}
