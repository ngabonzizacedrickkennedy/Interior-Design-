package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.DispatchChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationRequest(
        @NotNull Long recipientUserId,
        @NotNull DispatchChannel dispatchChannel,
        @NotBlank String messageBody
) {}
