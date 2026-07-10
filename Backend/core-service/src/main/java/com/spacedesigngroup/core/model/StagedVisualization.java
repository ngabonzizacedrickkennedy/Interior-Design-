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
public class StagedVisualization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id", nullable = false)
    private ServiceRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_attachment_id")
    private RequestAttachment sourceAttachment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StylePreference style;

    @Column(nullable = false)
    private String s3Key;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
