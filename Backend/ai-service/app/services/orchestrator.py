from app.schemas.assess import AssessRequest, AssessResponse
from app.services.reasoning_pipeline import reason_about_budget
from app.services.vision_pipeline import analyze_by_category


def run_assessment(request: AssessRequest) -> AssessResponse:
    visual_observations = analyze_by_category(request.attachments)
    return reason_about_budget(request, visual_observations)
