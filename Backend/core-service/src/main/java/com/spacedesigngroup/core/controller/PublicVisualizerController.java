package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.dto.ai.AiStageResultPayload;
import com.spacedesigngroup.core.model.StylePreference;
import com.spacedesigngroup.core.service.AiServiceClient;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@RestController
@RequestMapping("/api/public/visualizer")
@RequiredArgsConstructor
public class PublicVisualizerController {

    private static final long MAX_IMAGE_BYTES = 10L * 1024 * 1024;
    private static final int MAX_REQUESTS_PER_WINDOW = 5;
    private static final Duration WINDOW = Duration.ofHours(1);

    private final AiServiceClient aiServiceClient;
    private final Map<String, ConcurrentLinkedDeque<Instant>> requestLog = new ConcurrentHashMap<>();

    @PostMapping(value = "/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> generate(@RequestParam("style") String style,
                                         @RequestParam("image") MultipartFile image,
                                         HttpServletRequest httpRequest) throws IOException {
        enforceRateLimit(clientIp(httpRequest));

        if (image.isEmpty()) {
            throw new IllegalArgumentException("Please choose a photo to visualize.");
        }
        if (image.getSize() > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("That photo is too large. Please use an image under 10MB.");
        }
        StylePreference.valueOf(style);

        AiStageResultPayload result = aiServiceClient.generateStagedImageFromUpload(
                image.getBytes(), image.getOriginalFilename(), style);

        return Map.of("imageBase64", result.imageBase64());
    }

    private void enforceRateLimit(String ip) {
        Instant now = Instant.now();
        ConcurrentLinkedDeque<Instant> timestamps = requestLog.computeIfAbsent(ip, key -> new ConcurrentLinkedDeque<>());
        timestamps.removeIf(t -> t.isBefore(now.minus(WINDOW)));
        if (timestamps.size() >= MAX_REQUESTS_PER_WINDOW) {
            throw new ConflictException("You've reached the free demo limit. Create a free account to keep visualizing rooms.");
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
