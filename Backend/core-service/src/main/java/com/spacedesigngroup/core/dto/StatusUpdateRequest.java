package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.RequestStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull RequestStatus executionStatus) {}
