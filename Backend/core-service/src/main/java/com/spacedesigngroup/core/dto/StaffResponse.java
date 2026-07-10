package com.spacedesigngroup.core.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record StaffResponse(
        Long id,
        String name,
        Long creatorId,
        String creatorName,
        BigDecimal assignedBalance,
        LocalDateTime createdAt,
        List<StaffMembershipResponse> members
) {}
