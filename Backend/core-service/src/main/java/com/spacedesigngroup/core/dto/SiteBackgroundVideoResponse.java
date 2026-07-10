package com.spacedesigngroup.core.dto;

import java.time.LocalDateTime;

public record SiteBackgroundVideoResponse(
        String videoUrl,
        String originalFilename,
        LocalDateTime updatedAt
) {}
