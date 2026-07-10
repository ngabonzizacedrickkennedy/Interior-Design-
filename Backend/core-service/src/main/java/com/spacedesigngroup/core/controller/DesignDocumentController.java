package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.model.DocumentStatus;

import com.spacedesigngroup.core.service.DesignDocumentService;


import com.spacedesigngroup.core.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DesignDocumentController {

    private final DesignDocumentService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public List<DocumentResponse> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public DocumentResponse getById(@PathVariable Long id) { return service.findById(id); }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('CLIENT','STAFF','PROJECT_MANAGER','ADMIN')")
    public List<DocumentResponse> getByProject(@PathVariable Long projectId) {
        return service.findByProject(projectId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<DocumentResponse> upload(@Valid @RequestBody DocumentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.upload(request));
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<DocumentResponse> uploadFile(@RequestParam Long projectId,
                                                        @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.uploadFile(projectId, file));
    }

    @GetMapping("/approved")
    @PreAuthorize("hasRole('ADMIN')")
    public List<DocumentResponse> getApproved() {
        return service.findApproved();
    }

    @PostMapping("/{id}/ai-analysis")
    @PreAuthorize("hasRole('ADMIN')")
    public PortfolioAnalysisResponse analyze(@PathVariable Long id) {
        return service.analyze(id);
    }

    @PatchMapping("/{id}/new-version")
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public DocumentResponse incrementVersion(@PathVariable Long id) {
        return service.incrementVersion(id);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public DocumentResponse approve(@PathVariable Long id) {
        return service.updateStatus(id, DocumentStatus.APPROVED);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public DocumentResponse reject(@PathVariable Long id) {
        return service.updateStatus(id, DocumentStatus.REJECTED);
    }
}
