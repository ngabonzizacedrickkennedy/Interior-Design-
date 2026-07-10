package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotBlank;

public record StaffCreateRequest(@NotBlank String name) {}
