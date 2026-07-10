package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.DocumentStatus;

public record DocumentResponse(Long id, Long projectId, String fileStorageUrl,
                                Integer fileVersion, DocumentStatus approvalBadgeStatus) {}
