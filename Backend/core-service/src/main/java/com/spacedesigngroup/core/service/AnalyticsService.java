package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.dto.AnalyticsSnapshot;
import com.spacedesigngroup.core.dto.BusinessReport;
import com.spacedesigngroup.core.model.ProjectRecord;
import com.spacedesigngroup.core.model.ProjectStatus;
import com.spacedesigngroup.core.model.QuotationStatus;
import com.spacedesigngroup.core.model.RequestStatus;
import com.spacedesigngroup.core.model.WalletTransaction;
import com.spacedesigngroup.core.model.WalletTransactionType;
import com.spacedesigngroup.core.repository.ClientRepository;
import com.spacedesigngroup.core.repository.FeedbackRepository;
import com.spacedesigngroup.core.repository.ProjectRepository;
import com.spacedesigngroup.core.repository.QuotationRepository;
import com.spacedesigngroup.core.repository.ServiceRequestRepository;
import com.spacedesigngroup.core.repository.TaskRepository;
import com.spacedesigngroup.core.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ClientRepository clientRepository;
    private final ServiceRequestRepository requestRepository;
    private final QuotationRepository quotationRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final FeedbackRepository feedbackRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public BusinessReport buildReport(LocalDate periodStart, LocalDate periodEnd) {
        AnalyticsSnapshot snapshot = buildSnapshot();

        LocalDateTime rangeStart = periodStart.atStartOfDay();
        LocalDateTime rangeEnd = periodEnd.atTime(23, 59, 59);

        var periodTransactions = walletTransactionRepository.findByCreatedAtBetween(rangeStart, rangeEnd);
        BigDecimal periodDeposits = periodTransactions.stream()
                .filter(tx -> tx.getType() == WalletTransactionType.DEPOSIT)
                .map(WalletTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal periodInvestments = periodTransactions.stream()
                .filter(tx -> tx.getType() == WalletTransactionType.INVESTMENT)
                .map(WalletTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        var compensatedProjects = projectRepository.findByCompensatedAtBetween(rangeStart, rangeEnd);
        List<BusinessReport.CompensatedProjectLine> compensatedLines = compensatedProjects.stream()
                .map(this::toCompensatedLine)
                .toList();
        BigDecimal periodCompensatedTotal = compensatedProjects.stream()
                .map(p -> p.getRequest() != null && p.getRequest().getInvestedAmount() != null
                        ? p.getRequest().getInvestedAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        var periodFeedback = feedbackRepository.findByLoggedTimestampBetween(rangeStart, rangeEnd);
        Double periodAverageRating = periodFeedback.isEmpty() ? null :
                periodFeedback.stream().mapToInt(f -> f.getMetricRatingScore()).average().orElse(0);

        return new BusinessReport(
                periodStart, periodEnd, LocalDateTime.now(),
                periodDeposits, periodInvestments, periodTransactions.size(),
                periodCompensatedTotal, compensatedLines,
                periodFeedback.size(), periodAverageRating,
                snapshot.totalClients(), snapshot.totalRequests(), snapshot.approvedRequests(),
                snapshot.totalProjects(), snapshot.activeProjects(), snapshot.averageProjectProgress(),
                snapshot.totalTasks(), snapshot.completedTasks(), snapshot.taskCompletionRate(),
                snapshot.averageFeedbackRating(), snapshot.totalQuotations(), snapshot.approvedQuotations()
        );
    }

    private BusinessReport.CompensatedProjectLine toCompensatedLine(ProjectRecord project) {
        String clientName = project.getClient() != null ? project.getClient().getContactName() : "—";
        String requestName = project.getRequest() != null
                ? (project.getRequest().getRequestName() != null && !project.getRequest().getRequestName().isBlank()
                        ? project.getRequest().getRequestName() : project.getRequest().getRoomType())
                : "—";
        BigDecimal amount = project.getRequest() != null && project.getRequest().getInvestedAmount() != null
                ? project.getRequest().getInvestedAmount() : BigDecimal.ZERO;
        return new BusinessReport.CompensatedProjectLine(clientName, requestName, amount, project.getCompensatedAt());
    }

    public AnalyticsSnapshot buildSnapshot() {
        long totalClients = clientRepository.count();
        long totalRequests = requestRepository.count();
        long approvedRequests = requestRepository.findByExecutionStatus(RequestStatus.APPROVED).size()
                + requestRepository.findByExecutionStatus(RequestStatus.IN_PROGRESS).size()
                + requestRepository.findByExecutionStatus(RequestStatus.COMPLETED).size();

        var allProjects = projectRepository.findAll();
        long totalProjects = allProjects.size();
        long activeProjects = allProjects.stream()
                .filter(p -> p.getOperationalStatus() == ProjectStatus.ACTIVE).count();
        double avgProgress = allProjects.isEmpty() ? 0 :
                allProjects.stream().mapToInt(p -> p.getVisualProgressPercent()).average().orElse(0);

        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.findAll().stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsCompleted())).count();
        double taskRate = totalTasks == 0 ? 0 :
                Math.round(100.0 * completedTasks / totalTasks) / 100.0;

        Double avgRating = feedbackRepository.computeAverageRating();
        long totalQuotations = quotationRepository.count();
        long approvedQuotations = quotationRepository.findAll().stream()
                .filter(q -> q.getApprovalState() == QuotationStatus.APPROVED).count();

        return new AnalyticsSnapshot(
                totalClients, totalRequests, approvedRequests,
                totalProjects, activeProjects, avgProgress,
                totalTasks, completedTasks, taskRate,
                avgRating, totalQuotations, approvedQuotations
        );
    }
}
