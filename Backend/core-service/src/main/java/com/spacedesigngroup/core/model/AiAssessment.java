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
public class AiAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id", nullable = false)
    private ServiceRequest request;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentVerdict verdict;

    private BigDecimal recommendedBudgetMin;
    private BigDecimal recommendedBudgetMax;

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    @Column(columnDefinition = "TEXT")
    private String styleSummary;

    @Column(columnDefinition = "TEXT")
    private String roomConditionSummary;

    @Column(columnDefinition = "TEXT")
    private String rawModelResponseJson;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AssessmentAcknowledgement status = AssessmentAcknowledgement.PENDING;

    @Builder.Default
    private boolean systemTriggered = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
