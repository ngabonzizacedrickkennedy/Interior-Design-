package com.spacedesigngroup.core.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", unique = true)
    private ServiceRequest request;

    @Builder.Default
    private BigDecimal priceSubtotal = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal calculatedTax = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal finalTotal = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private QuotationStatus approvalState = QuotationStatus.DRAFT;

    @Builder.Default
    private boolean aiGenerated = false;

    private String aiVerdict;

    @Column(columnDefinition = "TEXT")
    private String aiReasoning;

    private BigDecimal aiRecommendedAmount;

    @Builder.Default
    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuotationLineItem> lineItems = new ArrayList<>();
}
