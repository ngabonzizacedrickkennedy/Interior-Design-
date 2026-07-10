package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DocumentRequest(@NotNull Long projectId, @NotBlank String fileStorageUrl) {}
