package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AiPortfolioAnalyzeResultPayload(
        @JsonProperty("recommended_task_titles") List<String> recommendedTaskTitles,
        @JsonProperty("reasoning") String reasoning
) {}
