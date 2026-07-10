package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.service.QuotationService;


import com.spacedesigngroup.core.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public List<QuotationResponse> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT','PROJECT_MANAGER','ADMIN')")
    public QuotationResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/request/{requestId}")
    @PreAuthorize("hasAnyRole('CLIENT','PROJECT_MANAGER','ADMIN')")
    public QuotationResponse getByRequest(@PathVariable Long requestId) {
        return service.findByRequest(requestId);
    }

    @PostMapping("/request/{requestId}")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<QuotationResponse> create(@PathVariable Long requestId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createForRequest(requestId));
    }

    @PostMapping("/{id}/line-items")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public QuotationResponse addLineItem(@PathVariable Long id,
                                         @Valid @RequestBody LineItemRequest request) {
        return service.addLineItem(id, request);
    }

    @DeleteMapping("/{id}/line-items/{itemId}")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public QuotationResponse removeLineItem(@PathVariable Long id, @PathVariable Long itemId) {
        return service.removeLineItem(id, itemId);
    }

    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public QuotationResponse submit(@PathVariable Long id) {
        return service.submitForApproval(id);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('CLIENT','PROJECT_MANAGER','ADMIN')")
    public QuotationResponse approve(@PathVariable Long id) {
        return service.approve(id);
    }

    @PatchMapping("/{id}/request-change")
    @PreAuthorize("hasAnyRole('CLIENT','PROJECT_MANAGER','ADMIN')")
    public QuotationResponse requestChange(@PathVariable Long id) {
        return service.requestChange(id);
    }

    @PatchMapping("/{id}/admit")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public QuotationResponse admit(@PathVariable Long id) {
        return service.admit(id);
    }

    @PatchMapping("/{id}/deny")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public QuotationResponse deny(@PathVariable Long id) {
        return service.deny(id);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('CLIENT')")
    public QuotationResponse reject(@PathVariable Long id) {
        return service.reject(id);
    }
}
