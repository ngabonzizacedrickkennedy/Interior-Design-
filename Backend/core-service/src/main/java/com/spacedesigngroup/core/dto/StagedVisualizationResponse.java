package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.StylePreference;

import java.time.LocalDateTime;

public record StagedVisualizationResponse(
        Long id,
        Long requestId,
        String originalImageUrl,
        String generatedImageUrl,
        StylePreference style,
        LocalDateTime createdAt
) {}
