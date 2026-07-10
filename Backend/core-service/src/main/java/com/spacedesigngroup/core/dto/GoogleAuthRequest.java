package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.auth.Role;
import jakarta.validation.constraints.NotBlank;

public record GoogleAuthRequest(
        @NotBlank String idToken,
        Role role
) {}
