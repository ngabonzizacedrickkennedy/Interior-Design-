package com.spacedesigngroup.core.dto;

import java.time.LocalDateTime;

public record CommunicationLogResponse(Long id, String noteEntry, String channel, LocalDateTime recordedAt) {}
