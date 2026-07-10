package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.auth.Role;
import jakarta.validation.constraints.NotNull;

public record RoleChangeRequest(@NotNull Role role) {}
