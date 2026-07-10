package com.spacedesigngroup.core.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PortfolioAnalysisResponse(
        Long id,
        List<String> recommendedTaskTitles,
        String reasoning,
        LocalDateTime createdAt
) {}
