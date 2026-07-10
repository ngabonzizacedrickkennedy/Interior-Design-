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
public class SiteBackgroundVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String videoFileKey;

    private String originalFilename;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
