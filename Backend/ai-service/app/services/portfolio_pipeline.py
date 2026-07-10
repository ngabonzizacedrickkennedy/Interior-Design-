from app.config import settings
from app.prompts.portfolio_prompt import TASK_MATCH_SYSTEM_PROMPT, VISION_OBSERVATION_PROMPT
from app.schemas.portfolio import PortfolioAnalyzeRequest, PortfolioAnalyzeResponse
from app.services.json_completion import complete_json


class PortfolioAnalysisError(Exception):
    pass


def _observe_files(files) -> str:
    content = [{"type": "text", "text": f"Analyze these {len(files)} design progress file(s)."}]
    for f in files:
        content.append({"type": "image_url", "image_url": {"url": f.url}})

    try:
        data = complete_json(VISION_OBSERVATION_PROMPT, content, settings.vision_model, temperature=0.2)
    except Exception:
        return "Visual analysis unavailable for one or more uploaded files (unreadable or invalid image)."
    if data is None:
        return "No usable visual analysis could be produced."
    return data.get("summary", "")


def analyze_portfolio(request: PortfolioAnalyzeRequest) -> PortfolioAnalyzeResponse:
    if not request.files:
        raise PortfolioAnalysisError("No files were provided to analyze")

    visual_summary = _observe_files(request.files)
    user_content = (
        f"Visual summary of uploaded progress files:\n{visual_summary}\n\n"
        f"Open task titles on this project:\n{request.task_titles}"
    )

    data = complete_json(TASK_MATCH_SYSTEM_PROMPT, user_content, settings.reasoning_model, temperature=0.2)
    if data is None:
        raise PortfolioAnalysisError("ai-service could not produce a valid portfolio analysis")
    return PortfolioAnalyzeResponse(**data)
