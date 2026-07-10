package com.spacedesigngroup.core.dto;

public record AnalyticsSnapshot(
        long totalClients,
        long totalRequests,
        long approvedRequests,
        long totalProjects,
        long activeProjects,
        double averageProjectProgress,
        long totalTasks,
        long completedTasks,
        double taskCompletionRate,
        Double averageFeedbackRating,
        long totalQuotations,
        long approvedQuotations
) {}
