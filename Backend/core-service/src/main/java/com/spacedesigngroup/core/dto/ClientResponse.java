package com.spacedesigngroup.core.dto;

import java.util.List;

public record ClientResponse(
        Long id,
        Long userId,
        String contactName,
        String contactEmail,
        String contactPhone,
        String propertyType,
        List<CommunicationLogResponse> communicationHistory
) {}
