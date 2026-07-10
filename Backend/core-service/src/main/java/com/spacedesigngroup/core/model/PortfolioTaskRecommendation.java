package com.spacedesigngroup.core.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioTaskRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private DesignDocument document;

    @Column(columnDefinition = "TEXT")
    private String recommendedTaskTitlesJson;

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
