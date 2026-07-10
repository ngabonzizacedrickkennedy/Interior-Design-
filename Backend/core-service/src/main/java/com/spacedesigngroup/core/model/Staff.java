package com.spacedesigngroup.core.model;

import com.spacedesigngroup.core.auth.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A designer-created project team ("Staff" on the Designer sidebar).
 * NOT related to {@link com.spacedesigngroup.core.auth.Role#STAFF}, which is the
 * individual "Designer" user role — a Staff here is a group of STAFF-role users.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Builder.Default
    private BigDecimal assignedBalance = BigDecimal.ZERO;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
