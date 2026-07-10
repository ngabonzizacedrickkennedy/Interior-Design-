package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.auth.Role;

public record LoginResponse(
        boolean otpRequired,
        String token,
        Long userId,
        String email,
        String fullName,
        Role role
) {

    public static LoginResponse otpRequired(String email) {
        return new LoginResponse(true, null, null, email, null, null);
    }

    public static LoginResponse success(AuthResponse auth) {
        return new LoginResponse(false, auth.token(), auth.userId(), auth.email(), auth.fullName(), auth.role());
    }
}
