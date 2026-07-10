package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.auth.Role;

public record UserProfileResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        String avatarUrl
) {}
