package com.spacedesigngroup.core.dto;

public record DesignerProfileLinksUpdateRequest(
        String githubUrl,
        String portfolioUrl,
        String otherLinkUrl
) {}
