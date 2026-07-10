package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.DesignerLedgerTransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DesignerLedgerTransactionResponse(
        Long id,
        DesignerLedgerTransactionType type,
        BigDecimal amount,
        Long relatedProjectId,
        Long relatedStaffId,
        BigDecimal balanceAfter,
        LocalDateTime createdAt
) {}
