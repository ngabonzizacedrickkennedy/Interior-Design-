package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.service.AnalyticsService;


import com.spacedesigngroup.core.dto.AnalyticsSnapshot;
import com.spacedesigngroup.core.dto.BusinessReport;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public AnalyticsSnapshot getSnapshot() {
        return service.buildSnapshot();
    }

    @GetMapping("/report")
    @PreAuthorize("hasRole('ADMIN')")
    public BusinessReport getReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        LocalDate periodEnd = end != null ? end : LocalDate.now();
        LocalDate periodStart = start != null ? start : periodEnd.withDayOfMonth(1);
        return service.buildReport(periodStart, periodEnd);
    }
}
