package com.spacedesigngroup.core.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerLedgerTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private DesignerWallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DesignerLedgerTransactionType type;

    @Column(nullable = false)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_project_id")
    private ProjectRecord relatedProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_staff_id")
    private Staff relatedStaff;

    @Column(nullable = false)
    private BigDecimal balanceAfter;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
