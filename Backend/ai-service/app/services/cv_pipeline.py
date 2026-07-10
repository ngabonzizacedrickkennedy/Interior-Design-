from app.config import settings
from app.prompts.cv_prompt import CANDIDATE_SUMMARY_SYSTEM_PROMPT, CV_ANALYSIS_SYSTEM_PROMPT
from app.schemas.cv import (
    CandidateSummaryRequest,
    CandidateSummaryResponse,
    CvAnalyzeRequest,
    CvAnalyzeResponse,
)
from app.services.cv_text import CvTextExtractionError, extract_text_from_pdf
from app.services.json_completion import complete_json


class CvAnalysisError(Exception):
    pass


def analyze_cv(request: CvAnalyzeRequest) -> CvAnalyzeResponse:
    try:
        cv_text = extract_text_from_pdf(request.cv_url)
    except CvTextExtractionError as exc:
        return CvAnalyzeResponse(is_cv=False, strength_score=None, reasoning=str(exc))

    if not cv_text:
        return CvAnalyzeResponse(
            is_cv=False,
            strength_score=None,
            reasoning="The uploaded file has no extractable text - it may be a scanned image or corrupted PDF.",
        )

    data = complete_json(
        CV_ANALYSIS_SYSTEM_PROMPT, f"CV text:\n{cv_text[:12000]}", settings.reasoning_model, temperature=0.2
    )
    if data is None:
        raise CvAnalysisError("ai-service could not produce a valid CV analysis")
    return CvAnalyzeResponse(**data)


def summarize_candidate(request: CandidateSummaryRequest) -> CandidateSummaryResponse:
    cv_text = ""
    if request.cv_url:
        try:
            cv_text = extract_text_from_pdf(request.cv_url)
        except CvTextExtractionError:
            cv_text = ""

    payload_lines = []
    if cv_text:
        payload_lines.append(f"CV text:\n{cv_text[:8000]}")
    if request.github_url:
        payload_lines.append(f"GitHub: {request.github_url}")
    if request.portfolio_url:
        payload_lines.append(f"Portfolio: {request.portfolio_url}")
    if request.other_link_url:
        payload_lines.append(f"Other link: {request.other_link_url}")

    if not payload_lines:
        return CandidateSummaryResponse(
            summary="This designer has not submitted enough professional background information yet to summarise."
        )

    data = complete_json(
        CANDIDATE_SUMMARY_SYSTEM_PROMPT, "\n\n".join(payload_lines), settings.reasoning_model, temperature=0.3
    )
    if data is None:
        raise CvAnalysisError("ai-service could not produce a valid candidate summary")
    return CandidateSummaryResponse(**data)
