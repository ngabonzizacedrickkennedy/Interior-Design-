package com.spacedesigngroup.core.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiSpaceUsagePayload(
        @JsonProperty("works_from_home") boolean worksFromHome,
        @JsonProperty("entertains_often") boolean entertainsOften,
        @JsonProperty("has_kids") boolean hasKids,
        @JsonProperty("has_pets") boolean hasPets,
        @JsonProperty("storage_needs") String storageNeeds
) {}
