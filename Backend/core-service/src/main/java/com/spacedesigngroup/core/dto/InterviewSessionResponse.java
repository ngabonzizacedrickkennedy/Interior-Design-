package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.InterviewStatus;

import java.time.LocalDateTime;
import java.util.List;

public record InterviewSessionResponse(
        Long id,
        List<String> questions,
        List<InterviewAnswerRequest> transcript,
        InterviewStatus status,
        Integer overallScore,
        String reasoning,
        LocalDateTime createdAt,
        LocalDateTime completedAt
) {}
