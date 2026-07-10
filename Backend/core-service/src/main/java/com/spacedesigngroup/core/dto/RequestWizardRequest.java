package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.LightLevel;
import com.spacedesigngroup.core.model.ProjectTimeline;
import com.spacedesigngroup.core.model.StylePreference;
import com.spacedesigngroup.core.model.WindowDirection;

import java.math.BigDecimal;
import java.util.List;

public record RequestWizardRequest(
        String requestName,
        String roomType,
        String requestDetails,
        BigDecimal lengthMeters,
        BigDecimal widthMeters,
        BigDecimal ceilingHeightMeters,
        String spatialNotes,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        List<StylePreference> styleTags,
        Boolean worksFromHome,
        Boolean entertainsOften,
        Boolean hasKids,
        Boolean hasPets,
        String storageNeeds,
        WindowDirection windowDirection,
        LightLevel naturalLightLevel,
        String artificialLightingNotes,
        ProjectTimeline timeline,
        String avoidNotes,
        String sourcingLocation
) {}
