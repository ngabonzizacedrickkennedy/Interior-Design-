package com.spacedesigngroup.core.model;

import com.spacedesigngroup.core.auth.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Builder.Default
    private BigDecimal assignedBalance = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal personalBalance = BigDecimal.ZERO;
}
