package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.dto.ProjectResponse;
import com.spacedesigngroup.core.dto.StaffAccountResponse;
import com.spacedesigngroup.core.dto.StaffCreateRequest;
import com.spacedesigngroup.core.dto.StaffInviteRequest;
import com.spacedesigngroup.core.dto.StaffMembershipResponse;
import com.spacedesigngroup.core.dto.StaffMessageRequest;
import com.spacedesigngroup.core.dto.StaffMessageResponse;
import com.spacedesigngroup.core.dto.StaffResponse;
import com.spacedesigngroup.core.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STAFF')")
public class StaffController {

    private final StaffService staffService;

    @PostMapping
    public ResponseEntity<StaffResponse> create(@AuthenticationPrincipal User caller, @Valid @RequestBody StaffCreateRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffService.create(caller.getId(), body.name()));
    }

    @GetMapping("/mine")
    public List<StaffResponse> mine(@AuthenticationPrincipal User caller) {
        return staffService.mine(caller.getId());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public List<StaffResponse> listAll() {
        return staffService.listAll();
    }

    @GetMapping("/{id}")
    public StaffResponse getById(@AuthenticationPrincipal User caller, @PathVariable Long id) {
        return staffService.getById(caller.getId(), id);
    }

    @PostMapping("/{id}/invitations")
    public ResponseEntity<Void> invite(@AuthenticationPrincipal User caller, @PathVariable Long id,
                                        @Valid @RequestBody StaffInviteRequest body) {
        staffService.invite(caller.getId(), id, body.designerUserIds());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/invitations/pending")
    public List<StaffMembershipResponse> pendingInvitations(@AuthenticationPrincipal User caller) {
        return staffService.pendingInvitations(caller.getId());
    }

    @PatchMapping("/invitations/{membershipId}/accept")
    public StaffMembershipResponse accept(@AuthenticationPrincipal User caller, @PathVariable Long membershipId) {
        return staffService.respondToInvitation(caller.getId(), membershipId, true);
    }

    @PatchMapping("/invitations/{membershipId}/decline")
    public StaffMembershipResponse decline(@AuthenticationPrincipal User caller, @PathVariable Long membershipId) {
        return staffService.respondToInvitation(caller.getId(), membershipId, false);
    }

    @GetMapping("/{id}/messages")
    public List<StaffMessageResponse> messages(@AuthenticationPrincipal User caller, @PathVariable Long id,
                                                @RequestParam(required = false) LocalDateTime since) {
        return staffService.messages(caller.getId(), id, since);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<StaffMessageResponse> postMessage(@AuthenticationPrincipal User caller, @PathVariable Long id,
                                                             @Valid @RequestBody StaffMessageRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffService.postMessage(caller.getId(), id, body.body()));
    }

    @GetMapping("/{id}/projects")
    public List<ProjectResponse> projects(@AuthenticationPrincipal User caller, @PathVariable Long id) {
        return staffService.projects(caller.getId(), id);
    }

    @GetMapping("/{id}/account")
    public StaffAccountResponse account(@AuthenticationPrincipal User caller, @PathVariable Long id) {
        return staffService.account(caller.getId(), id);
    }

    @PostMapping("/{id}/split")
    public StaffResponse split(@AuthenticationPrincipal User caller, @PathVariable Long id) {
        return staffService.split(caller.getId(), id);
    }
}
