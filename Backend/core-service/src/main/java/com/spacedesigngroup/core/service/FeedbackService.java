package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.FeedbackRequest;
import com.spacedesigngroup.core.dto.FeedbackResponse;
import com.spacedesigngroup.core.model.FeedbackLog;
import com.spacedesigngroup.core.repository.FeedbackRepository;
import com.spacedesigngroup.core.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ProjectRepository projectRepository;

    public List<FeedbackResponse> findAll() {
        return feedbackRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<FeedbackResponse> findByProject(Long projectId) {
        return feedbackRepository.findByProjectId(projectId).stream().map(this::toResponse).toList();
    }

    public FeedbackResponse submit(FeedbackRequest request) {
        var project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> ResourceNotFoundException.forEntity("ProjectRecord", request.projectId()));
        FeedbackLog log = FeedbackLog.builder()
                .project(project)
                .metricRatingScore(request.metricRatingScore())
                .feedbackNarrative(request.feedbackNarrative())
                .loggedTimestamp(LocalDateTime.now())
                .build();
        return toResponse(feedbackRepository.save(log));
    }

    public Double getAverageRating() {
        return feedbackRepository.computeAverageRating();
    }

    private FeedbackResponse toResponse(FeedbackLog f) {
        return new FeedbackResponse(f.getId(), f.getProject().getId(),
                f.getMetricRatingScore(), f.getFeedbackNarrative(), f.getLoggedTimestamp());
    }
}
