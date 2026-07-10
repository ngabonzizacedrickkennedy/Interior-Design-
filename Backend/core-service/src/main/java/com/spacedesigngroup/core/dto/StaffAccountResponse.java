package com.spacedesigngroup.core.dto;

import java.math.BigDecimal;

public record StaffAccountResponse(
        BigDecimal pendingAmount,
        BigDecimal assignedBalance
) {}
