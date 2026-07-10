package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.QuotationStatus;

import java.math.BigDecimal;
import java.util.List;

public record QuotationResponse(
        Long id,
        Long requestId,
        String clientName,
        List<LineItemResponse> lineItems,
        BigDecimal priceSubtotal,
        BigDecimal calculatedTax,
        BigDecimal finalTotal,
        QuotationStatus approvalState,
        boolean aiGenerated,
        String aiVerdict,
        String aiReasoning,
        BigDecimal aiRecommendedAmount
) {}
