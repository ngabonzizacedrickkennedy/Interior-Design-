package com.spacedesigngroup.core.dto;

import java.math.BigDecimal;

public record LineItemResponse(Long id, String itemDescription, BigDecimal baseCost) {}
