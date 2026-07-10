package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record WalletDepositRequest(
        @NotNull @Positive BigDecimal amount,
        @NotBlank String method
) {}
