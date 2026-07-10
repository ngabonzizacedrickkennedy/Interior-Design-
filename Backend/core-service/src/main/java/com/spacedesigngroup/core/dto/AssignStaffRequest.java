package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotNull;

public record AssignStaffRequest(@NotNull Long staffId) {}
