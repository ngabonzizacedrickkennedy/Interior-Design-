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
public class ProjectAssignmentAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectRecord project;

    @Enumerated(EnumType.STRING)
    private RecommendedAssignmentMode recommendedMode;

    private Integer complexityScore;

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    @Column(columnDefinition = "TEXT")
    private String rawModelResponseJson;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
