package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.service.AuditService;


import com.spacedesigngroup.core.auth.AuthService;
import com.spacedesigngroup.core.dto.CreateManagerRequest;
import com.spacedesigngroup.core.dto.RoleChangeRequest;
import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.spacedesigngroup.core.dto.AuditTrailResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final AuditService auditService;
    private final AuthService authService;

    @PostMapping("/managers")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<User> createManager(@Valid @RequestBody CreateManagerRequest request) {
        User saved = authService.createManager(request);
        auditService.record(saved.getId(), "Manager account created by admin");
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<User> changeRole(@PathVariable Long id,
                                            @Valid @RequestBody RoleChangeRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("User", id));
        String previousRole = user.getRole().name();
        user.setRole(request.role());
        User saved = userRepository.save(user);
        auditService.record(id, "Role changed from " + previousRole + " to " + request.role().name());
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/users/{id}/toggle-enabled")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<User> toggleEnabled(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("User", id));
        user.setEnabled(!user.isEnabled());
        User saved = userRepository.save(user);
        auditService.record(id, "Account " + (saved.isEnabled() ? "enabled" : "disabled"));
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/audit-trail")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<AuditTrailResponse> getAuditTrail() {
        return auditService.findAll();
    }

    @GetMapping("/audit-trail/user/{operatorId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<AuditTrailResponse> getAuditByOperator(@PathVariable Long operatorId) {
        return auditService.findByOperator(operatorId);
    }
}
