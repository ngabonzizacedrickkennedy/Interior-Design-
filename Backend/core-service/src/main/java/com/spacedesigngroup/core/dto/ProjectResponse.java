package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.MilestoneItem;
import com.spacedesigngroup.core.model.ProjectAssignmentType;
import com.spacedesigngroup.core.model.ProjectStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProjectResponse(
        Long id,
        Long clientId,
        String clientName,
        Long requestId,
        String requestName,
        List<MilestoneItem> milestones,
        Integer visualProgressPercent,
        ProjectStatus operationalStatus,
        ProjectAssignmentType assignmentType,
        Long assignedDesignerId,
        String assignedDesignerName,
        Long assignedStaffId,
        String assignedStaffName,
        LocalDateTime assignedAt,
        LocalDateTime compensatedAt,
        BigDecimal investedAmount
) {}
