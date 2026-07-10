package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.dto.ai.AiChatMessagePayload;
import com.spacedesigngroup.core.dto.ai.AiChatRequestPayload;
import com.spacedesigngroup.core.dto.ai.AiChatResultPayload;
import com.spacedesigngroup.core.dto.PublicChatRequest;
import com.spacedesigngroup.core.service.AiServiceClient;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@RestController
@RequestMapping("/api/public/chat")
@RequiredArgsConstructor
public class PublicChatController {

    private static final int MAX_MESSAGE_LENGTH = 1000;
    private static final int MAX_HISTORY_MESSAGES = 10;
    private static final int MAX_REQUESTS_PER_WINDOW = 20;
    private static final Duration WINDOW = Duration.ofHours(1);

    private final AiServiceClient aiServiceClient;
    private final Map<String, ConcurrentLinkedDeque<Instant>> requestLog = new ConcurrentHashMap<>();

    @PostMapping("/message")
    public Map<String, String> message(@Valid @RequestBody PublicChatRequest request, HttpServletRequest httpRequest) {
        enforceRateLimit(clientIp(httpRequest));

        String message = request.message().trim();
        if (message.isEmpty()) {
            throw new IllegalArgumentException("Please type a message first.");
        }
        if (message.length() > MAX_MESSAGE_LENGTH) {
            throw new IllegalArgumentException("That message is too long. Please keep it under "
                    + MAX_MESSAGE_LENGTH + " characters.");
        }

        List<AiChatMessagePayload> history = request.history() == null ? List.of() : request.history().stream()
                .skip(Math.max(0, request.history().size() - MAX_HISTORY_MESSAGES))
                .map(m -> new AiChatMessagePayload(m.role(), m.content()))
                .toList();

        AiChatResultPayload result = aiServiceClient.chat(new AiChatRequestPayload(message, history));
        return Map.of("reply", result.reply());
    }

    private void enforceRateLimit(String ip) {
        Instant now = Instant.now();
        ConcurrentLinkedDeque<Instant> timestamps = requestLog.computeIfAbsent(ip, key -> new ConcurrentLinkedDeque<>());
        timestamps.removeIf(t -> t.isBefore(now.minus(WINDOW)));
        if (timestamps.size() >= MAX_REQUESTS_PER_WINDOW) {
            throw new ConflictException("You've sent a lot of messages — please try again in a little while.");
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
