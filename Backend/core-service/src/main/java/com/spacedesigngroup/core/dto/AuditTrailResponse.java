package com.spacedesigngroup.core.dto;

import java.time.LocalDateTime;

public record AuditTrailResponse(Long id, Long operatorId, String operatorName,
                                  String historicalAction, LocalDateTime timestampLogged) {}
