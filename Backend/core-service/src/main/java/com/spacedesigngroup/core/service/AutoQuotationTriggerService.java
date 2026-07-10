package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.ai.AiAssessRequestPayload;
import com.spacedesigngroup.core.dto.ai.AiAssessResultPayload;
import com.spacedesigngroup.core.model.AiAssessment;
import com.spacedesigngroup.core.model.AssessmentAcknowledgement;
import com.spacedesigngroup.core.model.AssessmentVerdict;
import com.spacedesigngroup.core.model.ServiceRequest;
import com.spacedesigngroup.core.repository.AiAssessmentRepository;
import com.spacedesigngroup.core.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AutoQuotationTriggerService {

    private final AiServiceClient aiServiceClient;
    private final AiAssessRequestPayloadFactory payloadFactory;
    private final AiAssessmentRepository assessmentRepository;
    private final QuotationService quotationService;
    private final ServiceRequestRepository requestRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void runFor(Long requestId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("ServiceRequest", requestId));
        AiAssessRequestPayload payload = payloadFactory.build(request);
        AiAssessResultPayload result = aiServiceClient.assess(payload);
        AssessmentVerdict verdict = AssessmentVerdict.valueOf(result.verdict());
        AiAssessment assessment = AiAssessment.builder()
                .request(request)
                .verdict(verdict)
                .recommendedBudgetMin(result.recommendedBudgetMin())
                .recommendedBudgetMax(result.recommendedBudgetMax())
                .reasoning(result.reasoning())
                .styleSummary(result.styleSummary())
                .roomConditionSummary(result.roomConditionSummary())
                .status(verdict == AssessmentVerdict.SUFFICIENT
                        ? AssessmentAcknowledgement.ACKNOWLEDGED
                        : AssessmentAcknowledgement.PENDING)
                .systemTriggered(true)
                .build();
        assessment = assessmentRepository.save(assessment);
        quotationService.generateFromAssessment(request, assessment);
    }
}
