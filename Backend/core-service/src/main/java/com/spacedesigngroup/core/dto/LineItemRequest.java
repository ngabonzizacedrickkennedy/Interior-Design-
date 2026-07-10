package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record LineItemRequest(@NotBlank String itemDescription, @NotNull @Positive BigDecimal baseCost) {}
