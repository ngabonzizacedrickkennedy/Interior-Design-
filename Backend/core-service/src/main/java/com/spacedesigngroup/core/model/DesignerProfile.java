package com.spacedesigngroup.core.model;

import com.spacedesigngroup.core.auth.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    private String cvFileKey;

    private String cvOriginalFilename;

    private String githubUrl;

    private String portfolioUrl;

    private String otherLinkUrl;

    private Boolean cvIsValidDocument;

    private Integer cvStrengthScore;

    @Column(columnDefinition = "TEXT")
    private String cvReasoning;

    private LocalDateTime cvAnalyzedAt;

    private Integer interviewScore;

    @Column(columnDefinition = "TEXT")
    private String interviewReasoning;

    @Column(columnDefinition = "TEXT")
    private String capabilitySummaryCache;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DocumentStatus approvalStatus = DocumentStatus.PENDING;

    @Builder.Default
    private Integer profileCompletionPercent = 0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
}
