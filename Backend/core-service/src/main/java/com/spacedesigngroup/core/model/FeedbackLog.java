package com.spacedesigngroup.core.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectRecord project;

    @NotNull
    @Min(1) @Max(5)
    private Integer metricRatingScore;

    @Column(columnDefinition = "TEXT")
    private String feedbackNarrative;

    @Builder.Default
    private LocalDateTime loggedTimestamp = LocalDateTime.now();
}
