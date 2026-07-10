from app.config import settings
from app.prompts.interview_prompt import QUESTIONS_SYSTEM_PROMPT, SCORING_SYSTEM_PROMPT
from app.schemas.interview import (
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
    InterviewScoreRequest,
    InterviewScoreResponse,
)
from app.services.cv_text import CvTextExtractionError, extract_text_from_pdf
from app.services.json_completion import complete_json


class InterviewGenerationError(Exception):
    pass


def generate_questions(request: InterviewQuestionsRequest) -> InterviewQuestionsResponse:
    try:
        cv_text = extract_text_from_pdf(request.cv_url)
    except CvTextExtractionError as exc:
        raise InterviewGenerationError(str(exc)) from exc

    if not cv_text:
        raise InterviewGenerationError("No CV text available to generate interview questions from")

    for _ in range(2):
        data = complete_json(
            QUESTIONS_SYSTEM_PROMPT, f"CV text:\n{cv_text[:12000]}", settings.reasoning_model, temperature=0.4
        )
        if data is None:
            break
        try:
            parsed = InterviewQuestionsResponse(**data)
        except Exception:
            continue
        if len(parsed.questions) == 5:
            return parsed

    raise InterviewGenerationError("ai-service could not generate interview questions")


def score_interview(request: InterviewScoreRequest) -> InterviewScoreResponse:
    transcript_text = "\n\n".join(
        f"Q: {item.question}\nA: {item.answer or '(no answer given)'}" for item in request.transcript
    )

    data = complete_json(SCORING_SYSTEM_PROMPT, transcript_text, settings.reasoning_model, temperature=0.2)
    if data is None:
        raise InterviewGenerationError("ai-service could not score the interview")
    return InterviewScoreResponse(**data)
