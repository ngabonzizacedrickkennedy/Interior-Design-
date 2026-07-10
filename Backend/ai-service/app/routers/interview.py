import logging

from fastapi import APIRouter, HTTPException

from app.schemas.interview import (
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
    InterviewScoreRequest,
    InterviewScoreResponse,
)
from app.services.interview_pipeline import InterviewGenerationError, generate_questions, score_interview

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/interview/questions", response_model=InterviewQuestionsResponse)
def questions(request: InterviewQuestionsRequest):
    try:
        return generate_questions(request)
    except InterviewGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected failure while generating interview questions")
        raise HTTPException(status_code=502, detail="ai-service could not generate interview questions") from exc


@router.post("/interview/score", response_model=InterviewScoreResponse)
def score(request: InterviewScoreRequest):
    try:
        return score_interview(request)
    except InterviewGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected failure while scoring interview")
        raise HTTPException(status_code=502, detail="ai-service could not score the interview") from exc
