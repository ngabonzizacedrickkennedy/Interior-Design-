package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.dto.AiAssessmentResponse;
import com.spacedesigngroup.core.dto.BudgetAdjustRequest;
import com.spacedesigngroup.core.dto.ServiceRequestResponse;
import com.spacedesigngroup.core.service.AiAssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AiAssessmentController {

    private final AiAssessmentService assessmentService;

    @PostMapping("/api/requests/{id}/assessments")
    @PreAuthorize("hasAnyRole('CLIENT','PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<AiAssessmentResponse> trigger(@PathVariable Long id, @AuthenticationPrincipal User caller) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assessmentService.trigger(id, caller));
    }

    @GetMapping("/api/requests/{id}/assessments")
    @PreAuthorize("hasAnyRole('CLIENT','STAFF','PROJECT_MANAGER','ADMIN')")
    public List<AiAssessmentResponse> history(@PathVariable Long id, @AuthenticationPrincipal User caller) {
        return assessmentService.history(id, caller);
    }

    @GetMapping("/api/requests/{id}/assessments/latest")
    @PreAuthorize("hasAnyRole('CLIENT','STAFF','PROJECT_MANAGER','ADMIN')")
    public AiAssessmentResponse latest(@PathVariable Long id, @AuthenticationPrincipal User caller) {
        return assessmentService.latest(id, caller);
    }

    @PostMapping("/api/requests/{id}/assessments/{assessmentId}/remain")
    @PreAuthorize("hasRole('CLIENT')")
    public AiAssessmentResponse remain(@PathVariable Long id, @PathVariable Long assessmentId,
                                       @AuthenticationPrincipal User caller) {
        return assessmentService.remain(id, assessmentId, caller.getId());
    }

    @PatchMapping("/api/requests/{id}/budget")
    @PreAuthorize("hasRole('CLIENT')")
    public ServiceRequestResponse adjustBudget(@PathVariable Long id, @AuthenticationPrincipal User caller,
                                                @Valid @RequestBody BudgetAdjustRequest body) {
        return assessmentService.adjustBudget(id, caller.getId(), body);
    }
}
