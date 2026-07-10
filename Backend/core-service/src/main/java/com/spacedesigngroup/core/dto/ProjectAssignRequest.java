package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.ProjectAssignmentType;
import jakarta.validation.constraints.NotNull;

public record ProjectAssignRequest(
        @NotNull ProjectAssignmentType assignmentType,
        Long designerUserId,
        Long staffId
) {}
