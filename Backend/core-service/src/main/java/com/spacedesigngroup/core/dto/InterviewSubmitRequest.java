package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record InterviewSubmitRequest(
        @NotEmpty List<InterviewAnswerRequest> transcript
) {}
