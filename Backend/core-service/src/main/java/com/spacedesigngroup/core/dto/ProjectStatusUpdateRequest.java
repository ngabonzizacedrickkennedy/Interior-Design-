package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.ProjectStatus;
import jakarta.validation.constraints.NotNull;

public record ProjectStatusUpdateRequest(@NotNull ProjectStatus operationalStatus) {}
