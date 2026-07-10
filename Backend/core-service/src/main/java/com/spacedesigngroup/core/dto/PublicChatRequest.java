package com.spacedesigngroup.core.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record PublicChatRequest(
        @NotBlank String message,
        List<HistoryMessage> history
) {
    public record HistoryMessage(String role, String content) {}
}
