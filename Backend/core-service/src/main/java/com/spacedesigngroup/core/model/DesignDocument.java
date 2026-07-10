package com.spacedesigngroup.core.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectRecord project;

    @NotBlank
    private String fileStorageUrl;

    @Builder.Default
    private Integer fileVersion = 1;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DocumentStatus approvalBadgeStatus = DocumentStatus.PENDING;
}
