package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotBlank;

public record CommunicationLogRequest(@NotBlank String noteEntry, String channel) {}
