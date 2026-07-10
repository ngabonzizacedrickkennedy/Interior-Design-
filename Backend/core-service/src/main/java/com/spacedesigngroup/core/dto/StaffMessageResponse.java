package com.spacedesigngroup.core.dto;

import java.time.LocalDateTime;

public record StaffMessageResponse(
        Long id,
        Long staffId,
        Long senderId,
        String senderName,
        String body,
        LocalDateTime createdAt
) {}
