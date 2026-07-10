package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.dto.AttachmentNoteUpdateRequest;
import com.spacedesigngroup.core.dto.AttachmentResponse;
import com.spacedesigngroup.core.model.AttachmentCategory;
import com.spacedesigngroup.core.service.RequestAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/requests/{requestId}/attachments")
@RequiredArgsConstructor
public class RequestAttachmentController {

    private final RequestAttachmentService attachmentService;

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('CLIENT','PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<AttachmentResponse> upload(@PathVariable Long requestId,
                                                      @AuthenticationPrincipal User caller,
                                                      @RequestPart("file") MultipartFile file,
                                                      @RequestParam AttachmentCategory category,
                                                      @RequestParam(required = false) String note) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attachmentService.upload(requestId, caller, file, category, note));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CLIENT','STAFF','PROJECT_MANAGER','ADMIN')")
    public List<AttachmentResponse> list(@PathVariable Long requestId, @AuthenticationPrincipal User caller) {
        return attachmentService.list(requestId, caller);
    }

    @PatchMapping("/{attachmentId}")
    @PreAuthorize("hasRole('CLIENT')")
    public AttachmentResponse updateNote(@PathVariable Long requestId,
                                         @PathVariable Long attachmentId,
                                         @AuthenticationPrincipal User caller,
                                         @RequestBody AttachmentNoteUpdateRequest body) {
        return attachmentService.updateNote(requestId, attachmentId, caller.getId(), body);
    }

    @DeleteMapping("/{attachmentId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Void> delete(@PathVariable Long requestId,
                                        @PathVariable Long attachmentId,
                                        @AuthenticationPrincipal User caller) {
        attachmentService.delete(requestId, attachmentId, caller.getId());
        return ResponseEntity.noContent().build();
    }
}
