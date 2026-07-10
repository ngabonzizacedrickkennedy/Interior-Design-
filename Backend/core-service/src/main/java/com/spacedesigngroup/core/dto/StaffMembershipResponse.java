package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.StaffInvitationStatus;
import com.spacedesigngroup.core.model.StaffMembershipRole;

import java.time.LocalDateTime;

public record StaffMembershipResponse(
        Long id,
        Long staffId,
        String staffName,
        Long userId,
        String userFullName,
        StaffMembershipRole membershipRole,
        StaffInvitationStatus invitationStatus,
        LocalDateTime invitedAt,
        LocalDateTime respondedAt
) {}
