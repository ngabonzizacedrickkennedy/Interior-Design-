package com.spacedesigngroup.core.dto;

import java.math.BigDecimal;

public record DesignerWalletResponse(
        Long id,
        BigDecimal assignedBalance,
        BigDecimal personalBalance,
        BigDecimal pendingAmount
) {}
