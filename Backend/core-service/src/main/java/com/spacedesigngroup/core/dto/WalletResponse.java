package com.spacedesigngroup.core.dto;

import java.math.BigDecimal;

public record WalletResponse(
        Long id,
        Long clientId,
        BigDecimal balance
) {}
