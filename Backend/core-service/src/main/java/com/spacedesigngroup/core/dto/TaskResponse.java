package com.spacedesigngroup.core.dto;

import java.time.LocalDate;

public record TaskResponse(
        Long id,
        Long projectId,
        String projectName,
        String taskTitle,
        Long assignedDesignerId,
        String assignedDesignerName,
        LocalDate deadlineDate,
        Boolean isCompleted
) {}
