package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.service.ProjectService;


import com.spacedesigngroup.core.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public List<ProjectResponse> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT','STAFF','PROJECT_MANAGER','ADMIN')")
    public ProjectResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('CLIENT','PROJECT_MANAGER','ADMIN')")
    public List<ProjectResponse> getByClient(@PathVariable Long clientId) {
        return service.findByClient(clientId);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('STAFF')")
    public List<ProjectResponse> getMine(@AuthenticationPrincipal User caller) {
        return service.findMine(caller.getId());
    }

    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public List<ProjectResponse> getUnassigned() {
        return service.findUnassigned();
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public List<ProjectResponse> getAssigned() {
        return service.findAssigned();
    }

    @GetMapping("/blocked-amount")
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public BigDecimal getBlockedAmount() {
        return service.blockedInSystemAmount();
    }

    @PostMapping("/{id}/compensate")
    @PreAuthorize("hasRole('PROJECT_MANAGER')")
    public ProjectResponse compensate(@PathVariable Long id) {
        return service.compensate(id);
    }

    @PostMapping("/{id}/requirement-assessment")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ProjectAssignmentAssessmentResponse assessRequirement(@PathVariable Long id) {
        return service.assessRequirement(id);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ProjectResponse assign(@PathVariable Long id, @Valid @RequestBody ProjectAssignRequest request) {
        return service.assign(id, request);
    }

    @PatchMapping("/{id}/milestones")
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public ProjectResponse updateMilestones(@AuthenticationPrincipal User caller, @PathVariable Long id,
                                             @Valid @RequestBody MilestoneUpdateRequest request) {
        return service.updateMilestones(id, request, caller);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectResponse updateStatus(@PathVariable Long id,
                                         @Valid @RequestBody ProjectStatusUpdateRequest request) {
        return service.updateStatus(id, request);
    }
}
