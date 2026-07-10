package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ServiceRequestRequest(
        @NotNull Long clientId,
        @NotBlank String requestDetails,
        @NotNull @Positive BigDecimal budgetLimit
) {}
