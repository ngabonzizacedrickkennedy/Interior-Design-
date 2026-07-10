package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.dto.StageRequestBody;
import com.spacedesigngroup.core.dto.StagedVisualizationResponse;
import com.spacedesigngroup.core.service.StagingService;
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
public class StagingController {

    private final StagingService stagingService;

    @PostMapping("/api/requests/{id}/staging")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<StagedVisualizationResponse> generate(@PathVariable Long id,
                                                                 @AuthenticationPrincipal User caller,
                                                                 @Valid @RequestBody StageRequestBody body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stagingService.generate(id, caller, body));
    }

    @GetMapping("/api/requests/{id}/staging")
    @PreAuthorize("hasAnyRole('CLIENT','STAFF','PROJECT_MANAGER','ADMIN')")
    public List<StagedVisualizationResponse> history(@PathVariable Long id, @AuthenticationPrincipal User caller) {
        return stagingService.history(id, caller);
    }
}
