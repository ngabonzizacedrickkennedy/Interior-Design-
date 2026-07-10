package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BudgetAdjustRequest(
        @NotNull @Positive BigDecimal newBudget
) {}
