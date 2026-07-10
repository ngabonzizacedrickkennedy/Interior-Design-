package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.WalletTransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WalletTransactionResponse(
        Long id,
        WalletTransactionType type,
        BigDecimal amount,
        String method,
        Long relatedRequestId,
        BigDecimal balanceAfter,
        LocalDateTime createdAt
) {}
