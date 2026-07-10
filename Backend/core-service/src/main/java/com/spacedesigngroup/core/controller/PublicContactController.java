package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.auth.MailService;
import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.dto.ContactMessageRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@RestController
@RequestMapping("/api/public/contact")
@RequiredArgsConstructor
public class PublicContactController {

    private static final int MAX_REQUESTS_PER_WINDOW = 5;
    private static final Duration WINDOW = Duration.ofHours(1);

    private final MailService mailService;
    private final Map<String, ConcurrentLinkedDeque<Instant>> requestLog = new ConcurrentHashMap<>();

    @PostMapping
    public ResponseEntity<Void> send(@Valid @RequestBody ContactMessageRequest body,
                                      HttpServletRequest httpRequest) {
        enforceRateLimit(clientIp(httpRequest));
        mailService.sendContactMessageEmail(body.name(), body.email(), body.phone(), body.message());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    private void enforceRateLimit(String ip) {
        Instant now = Instant.now();
        ConcurrentLinkedDeque<Instant> timestamps = requestLog.computeIfAbsent(ip, key -> new ConcurrentLinkedDeque<>());
        timestamps.removeIf(t -> t.isBefore(now.minus(WINDOW)));
        if (timestamps.size() >= MAX_REQUESTS_PER_WINDOW) {
            throw new ConflictException("You've sent several messages recently. Please wait a while before sending another.");
        }
        timestamps.add(now);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
