package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AiPortfolioAnalyzeRequestPayload(
        @JsonProperty("files") List<AiPortfolioFilePayload> files,
        @JsonProperty("task_titles") List<String> taskTitles
) {}
