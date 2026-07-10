package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.*;

public record FeedbackRequest(
        @NotNull Long projectId,
        @NotNull @Min(1) @Max(5) Integer metricRatingScore,
        String feedbackNarrative
) {}
