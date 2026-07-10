package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.service.ServiceRequestService;


import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public List<ServiceRequestResponse> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT','STAFF','PROJECT_MANAGER','ADMIN')")
    public ServiceRequestResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CLIENT')")
    public List<ServiceRequestResponse> getMine(@AuthenticationPrincipal User caller) {
        return service.findMine(caller.getId());
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('CLIENT','STAFF','PROJECT_MANAGER','ADMIN')")
    public List<ServiceRequestResponse> getByClient(@PathVariable Long clientId) {
        return service.findByClient(clientId);
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public List<ServiceRequestResponse> getByStaff(@PathVariable Long staffId) {
        return service.findByStaff(staffId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT','PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<ServiceRequestResponse> create(@Valid @RequestBody ServiceRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PostMapping("/draft")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ServiceRequestResponse> createDraft(@AuthenticationPrincipal User caller) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createDraft(caller.getId()));
    }

    @PatchMapping("/{id}/draft")
    @PreAuthorize("hasRole('CLIENT')")
    public ServiceRequestResponse updateDraft(@PathVariable Long id,
                                               @AuthenticationPrincipal User caller,
                                               @RequestBody RequestWizardRequest request) {
        return service.updateDraft(id, caller.getId(), request);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('CLIENT')")
    public ServiceRequestResponse submit(@PathVariable Long id, @AuthenticationPrincipal User caller) {
        return service.submit(id, caller.getId());
    }

    @DeleteMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Void> withdraw(@PathVariable Long id, @AuthenticationPrincipal User caller) {
        service.withdraw(id, caller.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ServiceRequestResponse assignStaff(@PathVariable Long id,
                                               @Valid @RequestBody AssignStaffRequest request) {
        return service.assignStaff(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public ServiceRequestResponse updateStatus(@PathVariable Long id,
                                                @Valid @RequestBody StatusUpdateRequest request) {
        return service.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
