package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.dto.InterviewSessionResponse;
import com.spacedesigngroup.core.dto.InterviewSubmitRequest;
import com.spacedesigngroup.core.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STAFF')")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/generate")
    public InterviewSessionResponse generate(@AuthenticationPrincipal User caller) {
        return interviewService.generate(caller.getId());
    }

    @PostMapping("/{id}/submit")
    public InterviewSessionResponse submit(@AuthenticationPrincipal User caller, @PathVariable Long id,
                                            @Valid @RequestBody InterviewSubmitRequest body) {
        return interviewService.submit(caller.getId(), id, body);
    }

    @GetMapping("/me/latest")
    public InterviewSessionResponse latest(@AuthenticationPrincipal User caller) {
        return interviewService.latestForMe(caller.getId());
    }
}
