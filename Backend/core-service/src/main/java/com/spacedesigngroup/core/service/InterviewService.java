package com.spacedesigngroup.core.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spacedesigngroup.core.common.exception.ConflictException;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.InterviewAnswerRequest;
import com.spacedesigngroup.core.dto.InterviewSessionResponse;
import com.spacedesigngroup.core.dto.InterviewSubmitRequest;
import com.spacedesigngroup.core.dto.ai.AiInterviewAnswerPayload;
import com.spacedesigngroup.core.dto.ai.AiInterviewQuestionsRequestPayload;
import com.spacedesigngroup.core.dto.ai.AiInterviewQuestionsResultPayload;
import com.spacedesigngroup.core.dto.ai.AiInterviewScoreRequestPayload;
import com.spacedesigngroup.core.dto.ai.AiInterviewScoreResultPayload;
import com.spacedesigngroup.core.model.DesignerProfile;
import com.spacedesigngroup.core.model.InterviewSession;
import com.spacedesigngroup.core.model.InterviewStatus;
import com.spacedesigngroup.core.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InterviewService {

    private final InterviewSessionRepository interviewSessionRepository;
    private final DesignerProfileService designerProfileService;
    private final S3Service s3Service;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public InterviewSessionResponse generate(Long userId) {
        DesignerProfile profile = designerProfileService.getOrCreateProfileEntity(userId);
        if (profile.getCvFileKey() == null) {
            throw new ConflictException("Upload your CV in Professional Background before starting the interview.");
        }

        AiInterviewQuestionsResultPayload result = aiServiceClient.generateInterviewQuestions(
                new AiInterviewQuestionsRequestPayload(s3Service.publicUrl(profile.getCvFileKey())));

        InterviewSession session = InterviewSession.builder()
                .designerProfile(profile)
                .questionsJson(writeJson(result.questions()))
                .status(InterviewStatus.IN_PROGRESS)
                .build();

        return toResponse(interviewSessionRepository.save(session));
    }

    public InterviewSessionResponse submit(Long userId, Long sessionId, InterviewSubmitRequest body) {
        DesignerProfile profile = designerProfileService.getOrCreateProfileEntity(userId);
        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("InterviewSession", sessionId));

        if (!session.getDesignerProfile().getId().equals(profile.getId())) {
            throw new ResourceNotFoundException("InterviewSession not found with id " + sessionId);
        }

        List<AiInterviewAnswerPayload> transcript = body.transcript().stream()
                .map(a -> new AiInterviewAnswerPayload(a.question(), a.answer()))
                .toList();

        AiInterviewScoreResultPayload result = aiServiceClient.scoreInterview(new AiInterviewScoreRequestPayload(transcript));

        session.setTranscriptJson(writeJson(body.transcript()));
        session.setOverallScore(result.score());
        session.setReasoning(result.reasoning());
        session.setStatus(InterviewStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        InterviewSession saved = interviewSessionRepository.save(session);

        designerProfileService.applyInterviewResult(profile.getId(), result.score(), result.reasoning());
        return toResponse(saved);
    }

    public InterviewSessionResponse latestForMe(Long userId) {
        DesignerProfile profile = designerProfileService.getOrCreateProfileEntity(userId);
        return interviewSessionRepository.findByDesignerProfileIdOrderByCreatedAtDesc(profile.getId()).stream()
                .findFirst()
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No interview session found yet"));
    }

    private InterviewSessionResponse toResponse(InterviewSession s) {
        return new InterviewSessionResponse(
                s.getId(),
                readJson(s.getQuestionsJson(), new TypeReference<List<String>>() {}),
                readJson(s.getTranscriptJson(), new TypeReference<List<InterviewAnswerRequest>>() {}),
                s.getStatus(),
                s.getOverallScore(),
                s.getReasoning(),
                s.getCreatedAt(),
                s.getCompletedAt()
        );
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not serialize interview data", ex);
        }
    }

    private <T> T readJson(String json, TypeReference<T> type) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not deserialize interview data", ex);
        }
    }
}
