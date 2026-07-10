package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.dto.DesignerProfileLinksUpdateRequest;
import com.spacedesigngroup.core.dto.DesignerProfileResponse;
import com.spacedesigngroup.core.dto.DesignerSummaryResponse;
import com.spacedesigngroup.core.service.DesignerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/designer-profiles")
@RequiredArgsConstructor
public class DesignerProfileController {

    private final DesignerProfileService designerProfileService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('STAFF')")
    public DesignerProfileResponse me(@AuthenticationPrincipal User caller) {
        return designerProfileService.getOrCreateForMe(caller.getId());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('STAFF')")
    public DesignerProfileResponse updateMe(@AuthenticationPrincipal User caller, @RequestBody DesignerProfileLinksUpdateRequest body) {
        return designerProfileService.updateLinks(caller.getId(), body);
    }

    @PostMapping(value = "/me/cv", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('STAFF')")
    public DesignerProfileResponse uploadCv(@AuthenticationPrincipal User caller, @RequestPart("file") MultipartFile file) throws IOException {
        return designerProfileService.uploadCv(caller.getId(), file);
    }

    @GetMapping("/candidates")
    @PreAuthorize("hasRole('STAFF')")
    public List<DesignerProfileResponse> candidates(@AuthenticationPrincipal User caller) {
        return designerProfileService.listCandidates(caller.getId());
    }

    @GetMapping("/{id}/ai-summary")
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public DesignerSummaryResponse aiSummary(@PathVariable Long id) {
        return designerProfileService.aiSummary(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public List<DesignerProfileResponse> listAll() {
        return designerProfileService.listAll();
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public DesignerProfileResponse approve(@PathVariable Long id) {
        return designerProfileService.approve(id);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public DesignerProfileResponse reject(@PathVariable Long id) {
        return designerProfileService.reject(id);
    }
}
