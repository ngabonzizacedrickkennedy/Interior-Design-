package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.dto.SiteBackgroundVideoResponse;
import com.spacedesigngroup.core.service.SiteBackgroundVideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/site-background-video")
@RequiredArgsConstructor
public class SiteBackgroundVideoController {

    private final SiteBackgroundVideoService service;

    @GetMapping
    public SiteBackgroundVideoResponse getCurrent() {
        return service.getCurrent();
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public SiteBackgroundVideoResponse upload(@RequestPart("file") MultipartFile file) throws IOException {
        return service.upload(file);
    }
}
