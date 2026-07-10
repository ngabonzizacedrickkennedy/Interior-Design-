package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.DispatchChannel;

import java.time.LocalDateTime;

public record NotificationResponse(Long id, Long recipientUserId, DispatchChannel dispatchChannel,
                                    String messageBody, Boolean wasRead, LocalDateTime createdAt) {}
