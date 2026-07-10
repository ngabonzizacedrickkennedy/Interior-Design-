package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.auth.Role;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.LineItemRequest;
import com.spacedesigngroup.core.dto.NotificationRequest;
import com.spacedesigngroup.core.dto.QuotationResponse;
import com.spacedesigngroup.core.dto.LineItemResponse;
import com.spacedesigngroup.core.model.AiAssessment;
import com.spacedesigngroup.core.model.AssessmentVerdict;
import com.spacedesigngroup.core.model.DispatchChannel;
import com.spacedesigngroup.core.model.InvestmentStatus;
import com.spacedesigngroup.core.model.ProjectRecord;
import com.spacedesigngroup.core.model.ProjectStatus;
import com.spacedesigngroup.core.model.Quotation;
import com.spacedesigngroup.core.model.QuotationLineItem;
import com.spacedesigngroup.core.model.QuotationStatus;
import com.spacedesigngroup.core.model.RequestStatus;
import com.spacedesigngroup.core.model.ServiceRequest;
import com.spacedesigngroup.core.model.TaskAssignment;
import com.spacedesigngroup.core.repository.ProjectRepository;
import com.spacedesigngroup.core.repository.QuotationRepository;
import com.spacedesigngroup.core.repository.ServiceRequestRepository;
import com.spacedesigngroup.core.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QuotationService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.18");

    private final QuotationRepository quotationRepository;
    private final ServiceRequestRepository requestRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public QuotationResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public QuotationResponse findByRequest(Long requestId) {
        return toResponse(quotationRepository.findByRequestId(requestId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Quotation", requestId)));
    }

    public List<QuotationResponse> findAll() {
        return quotationRepository.findAll().stream().map(this::toResponse).toList();
    }

    public QuotationResponse createForRequest(Long requestId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("ServiceRequest", requestId));
        if (request.getExecutionStatus() != RequestStatus.APPROVED
                && request.getExecutionStatus() != RequestStatus.IN_REVIEW) {
            throw new IllegalStateException("Quotation can only be created for requests in IN_REVIEW or APPROVED status.");
        }
        if (quotationRepository.existsByRequestId(requestId)) {
            throw new IllegalStateException("A quotation already exists for request " + requestId);
        }
        Quotation quotation = Quotation.builder().request(request).build();
        return toResponse(quotationRepository.save(quotation));
    }

    public QuotationResponse addLineItem(Long quotationId, LineItemRequest request) {
        Quotation quotation = getOrThrow(quotationId);
        QuotationLineItem item = QuotationLineItem.builder()
                .quotation(quotation)
                .itemDescription(request.itemDescription())
                .baseCost(request.baseCost())
                .build();
        quotation.getLineItems().add(item);
        recalculate(quotation);
        return toResponse(quotationRepository.save(quotation));
    }

    public QuotationResponse removeLineItem(Long quotationId, Long itemId) {
        Quotation quotation = getOrThrow(quotationId);
        quotation.getLineItems().removeIf(i -> i.getId().equals(itemId));
        recalculate(quotation);
        return toResponse(quotationRepository.save(quotation));
    }

    public QuotationResponse submitForApproval(Long id) {
        Quotation quotation = getOrThrow(id);
        if (quotation.getLineItems().isEmpty()) {
            throw new IllegalStateException("Cannot submit a quotation with no line items.");
        }
        quotation.setApprovalState(QuotationStatus.PENDING_APPROVAL);
        Quotation saved = quotationRepository.save(quotation);
        notifyClientQuotationReady(saved);
        return toResponse(saved);
    }

    public void generateFromAssessment(ServiceRequest request, AiAssessment assessment) {
        if (quotationRepository.existsByRequestId(request.getId())) {
            return;
        }
        boolean sufficient = assessment.getVerdict() == AssessmentVerdict.SUFFICIENT;
        BigDecimal recommendedAmount = sufficient
                ? request.getBudgetLimit()
                : assessment.getRecommendedBudgetMax();

        Quotation quotation = Quotation.builder()
                .request(request)
                .aiGenerated(true)
                .aiVerdict(assessment.getVerdict().name())
                .aiReasoning(assessment.getReasoning())
                .aiRecommendedAmount(recommendedAmount)
                .approvalState(QuotationStatus.AWAITING_ADMIN_REVIEW)
                .build();
        quotationRepository.save(quotation);
        notifyAdminsQuotationAwaitingReview(request);
    }

    public QuotationResponse admit(Long id) {
        Quotation quotation = getOrThrow(id);
        if (quotation.getApprovalState() != QuotationStatus.AWAITING_ADMIN_REVIEW) {
            throw new IllegalStateException("Only a quotation awaiting review can be admitted.");
        }
        boolean sufficient = "SUFFICIENT".equals(quotation.getAiVerdict());
        String description = sufficient
                ? "AI-confirmed project estimate — " + quotation.getAiReasoning()
                : "AI-recommended budget increase — " + quotation.getAiReasoning();
        QuotationLineItem item = QuotationLineItem.builder()
                .quotation(quotation)
                .itemDescription(description)
                .baseCost(quotation.getAiRecommendedAmount())
                .build();
        quotation.getLineItems().add(item);
        recalculate(quotation);
        quotation.setApprovalState(QuotationStatus.PENDING_APPROVAL);
        Quotation saved = quotationRepository.save(quotation);
        notifyClientQuotationReady(saved);
        return toResponse(saved);
    }

    public QuotationResponse deny(Long id) {
        Quotation quotation = getOrThrow(id);
        if (quotation.getApprovalState() != QuotationStatus.AWAITING_ADMIN_REVIEW) {
            throw new IllegalStateException("Only a quotation awaiting review can be denied.");
        }
        quotation.setApprovalState(QuotationStatus.DRAFT);
        return toResponse(quotationRepository.save(quotation));
    }

    public QuotationResponse approve(Long id) {
        Quotation quotation = getOrThrow(id);
        quotation.setApprovalState(QuotationStatus.APPROVED);
        quotationRepository.save(quotation);
        ServiceRequest request = quotation.getRequest();
        request.setExecutionStatus(RequestStatus.IN_PROGRESS);
        requestRepository.save(request);
        ProjectStatus status = request.getInvestmentStatus() == InvestmentStatus.INVESTED
                ? ProjectStatus.READY : ProjectStatus.PENDING;
        upsertProject(request, status);
        return toResponse(quotation);
    }

    public QuotationResponse reject(Long id) {
        Quotation quotation = getOrThrow(id);
        quotation.setApprovalState(QuotationStatus.REJECTED);
        quotationRepository.save(quotation);
        upsertProject(quotation.getRequest(), ProjectStatus.NOT_READY);
        return toResponse(quotation);
    }

    public QuotationResponse requestChange(Long id) {
        Quotation quotation = getOrThrow(id);
        quotation.setApprovalState(QuotationStatus.CHANGE_REQUESTED);
        return toResponse(quotationRepository.save(quotation));
    }

    private void upsertProject(ServiceRequest request, ProjectStatus status) {
        ProjectRecord project = projectRepository.findByRequestId(request.getId()).orElse(null);
        if (project == null) {
            String milestonesJson = "[" +
                    "{\"name\":\"Project kickoff and site survey\",\"isAchieved\":false}," +
                    "{\"name\":\"Design concept approval\",\"isAchieved\":false}," +
                    "{\"name\":\"Materials and furniture procurement\",\"isAchieved\":false}," +
                    "{\"name\":\"Installation and fit-out\",\"isAchieved\":false}," +
                    "{\"name\":\"Final styling and client handover\",\"isAchieved\":false}" +
                    "]";
            ProjectRecord saved = projectRepository.save(ProjectRecord.builder()
                    .client(request.getClient())
                    .request(request)
                    .milestoneChecklistJson(milestonesJson)
                    .visualProgressPercent(0)
                    .operationalStatus(status)
                    .build());
            if (status == ProjectStatus.READY) {
                taskRepository.save(TaskAssignment.builder()
                        .project(saved)
                        .taskTitle("Project kickoff and site survey")
                        .deadlineDate(LocalDate.now().plusDays(14))
                        .isCompleted(false)
                        .build());
            }
            return;
        }
        project.setOperationalStatus(status);
        projectRepository.save(project);
    }

    private void recalculate(Quotation quotation) {
        BigDecimal subtotal = quotation.getLineItems().stream()
                .map(QuotationLineItem::getBaseCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        quotation.setPriceSubtotal(subtotal);
        quotation.setCalculatedTax(tax);
        quotation.setFinalTotal(subtotal.add(tax));
    }

    private Quotation getOrThrow(Long id) {
        return quotationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Quotation", id));
    }

    private String resolveRequestName(ServiceRequest request) {
        if (request == null) return "your request";
        return request.getRequestName() != null && !request.getRequestName().isBlank()
                ? request.getRequestName() : request.getRoomType();
    }

    private void notifyAdminsQuotationAwaitingReview(ServiceRequest request) {
        String message = "A new AI-generated quotation for \"" + resolveRequestName(request)
                + "\" is awaiting your review.";
        userRepository.findByRole(Role.ADMIN)
                .forEach(admin -> notificationService.send(new NotificationRequest(admin.getId(),
                        DispatchChannel.IN_APP, message)));
    }

    private void notifyClientQuotationReady(Quotation quotation) {
        ServiceRequest request = quotation.getRequest();
        if (request == null || request.getClient() == null || request.getClient().getUser() == null) return;
        notificationService.send(new NotificationRequest(request.getClient().getUser().getId(),
                DispatchChannel.IN_APP,
                "Your quotation for \"" + resolveRequestName(request) + "\" is ready for your approval."));
    }

    private QuotationResponse toResponse(Quotation q) {
        List<LineItemResponse> items = q.getLineItems().stream()
                .map(i -> new LineItemResponse(i.getId(), i.getItemDescription(), i.getBaseCost()))
                .toList();
        String clientName = q.getRequest() != null && q.getRequest().getClient() != null
                ? q.getRequest().getClient().getContactName() : "";
        return new QuotationResponse(
                q.getId(),
                q.getRequest() != null ? q.getRequest().getId() : null,
                clientName,
                items,
                q.getPriceSubtotal(),
                q.getCalculatedTax(),
                q.getFinalTotal(),
                q.getApprovalState(),
                q.isAiGenerated(),
                q.getAiVerdict(),
                q.getAiReasoning(),
                q.getAiRecommendedAmount()
        );
    }
}
