package com.spacedesigngroup.core.dto;

import java.time.LocalDateTime;

public record FeedbackResponse(Long id, Long projectId, Integer metricRatingScore,
                                String feedbackNarrative, LocalDateTime loggedTimestamp) {}
