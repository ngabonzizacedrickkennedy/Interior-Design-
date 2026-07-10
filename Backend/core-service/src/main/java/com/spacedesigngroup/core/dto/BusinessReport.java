package com.spacedesigngroup.core.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record BusinessReport(
        LocalDate periodStart,
        LocalDate periodEnd,
        LocalDateTime generatedAt,

        // Financials, scoped to the period
        BigDecimal periodDeposits,
        BigDecimal periodInvestments,
        long periodTransactionCount,
        BigDecimal periodCompensatedTotal,
        List<CompensatedProjectLine> periodCompensatedProjects,

        // Client satisfaction, scoped to the period
        long periodFeedbackCount,
        Double periodAverageRating,

        // Business snapshot, as of the report date
        long totalClients,
        long totalRequests,
        long approvedRequests,
        long totalProjects,
        long activeProjects,
        double averageProjectProgress,
        long totalTasks,
        long completedTasks,
        double taskCompletionRate,
        Double averageFeedbackRatingAllTime,
        long totalQuotations,
        long approvedQuotations
) {
    public record CompensatedProjectLine(
            String clientName,
            String requestName,
            BigDecimal amount,
            LocalDateTime compensatedAt
    ) {}
}
