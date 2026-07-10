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
public class StaffMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private User member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StaffMembershipRole membershipRole;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StaffInvitationStatus invitationStatus = StaffInvitationStatus.INVITED;

    @Builder.Default
    private LocalDateTime invitedAt = LocalDateTime.now();

    private LocalDateTime respondedAt;
}
