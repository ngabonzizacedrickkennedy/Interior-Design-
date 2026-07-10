package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.StylePreference;
import jakarta.validation.constraints.NotNull;

public record StageRequestBody(
        @NotNull Long attachmentId,
        @NotNull StylePreference style
) {}
