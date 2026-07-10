package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotBlank;

public record StaffMessageRequest(@NotBlank String body) {}
