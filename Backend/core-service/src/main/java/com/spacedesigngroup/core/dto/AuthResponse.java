package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.auth.Role;

public record AuthResponse(String token, Long userId, String email, String fullName, Role role) {}
