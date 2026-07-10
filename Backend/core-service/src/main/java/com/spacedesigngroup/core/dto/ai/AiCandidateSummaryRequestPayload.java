package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiCandidateSummaryRequestPayload(
        @JsonProperty("cv_url") String cvUrl,
        @JsonProperty("github_url") String githubUrl,
        @JsonProperty("portfolio_url") String portfolioUrl,
        @JsonProperty("other_link_url") String otherLinkUrl
) {}
