package com.spacedesigngroup.core.dto;

import com.spacedesigngroup.core.model.MilestoneItem;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record MilestoneUpdateRequest(@NotNull List<MilestoneItem> milestones) {}
