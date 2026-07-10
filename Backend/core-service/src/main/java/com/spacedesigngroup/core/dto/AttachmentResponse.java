package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.AttachmentCategory;

import java.time.LocalDateTime;

public record AttachmentResponse(
        Long id,
        AttachmentCategory category,
        String url,
        String note,
        String originalFileName,
        LocalDateTime uploadedAt
) {}
