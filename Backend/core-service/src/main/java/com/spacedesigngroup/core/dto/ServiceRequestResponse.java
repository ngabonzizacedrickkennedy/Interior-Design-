package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.InvestmentStatus;
import com.spacedesigngroup.core.model.LightLevel;
import com.spacedesigngroup.core.model.ProjectTimeline;
import com.spacedesigngroup.core.model.RequestStatus;
import com.spacedesigngroup.core.model.StylePreference;
import com.spacedesigngroup.core.model.WindowDirection;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ServiceRequestResponse(
        Long id,
        Long clientId,
        String clientName,
        String requestDetails,
        BigDecimal budgetLimit,
        RequestStatus executionStatus,
        Long assignedStaffId,
        String assignedStaffName,

        String requestName,
        String roomType,
        BigDecimal lengthMeters,
        BigDecimal widthMeters,
        BigDecimal ceilingHeightMeters,
        String spatialNotes,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        List<StylePreference> styleTags,
        boolean worksFromHome,
        boolean entertainsOften,
        boolean hasKids,
        boolean hasPets,
        String storageNeeds,
        WindowDirection windowDirection,
        LightLevel naturalLightLevel,
        String artificialLightingNotes,
        ProjectTimeline timeline,
        String avoidNotes,
        String sourcingLocation,
        InvestmentStatus investmentStatus,
        BigDecimal investedAmount,
        LocalDateTime investedAt,
        List<AttachmentResponse> attachments,
        AiAssessmentResponse latestAssessment
) {}
