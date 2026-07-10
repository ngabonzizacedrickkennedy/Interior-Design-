import json

from app.config import settings
from app.prompts.project_assessment_prompt import REQUIREMENT_ASSESSMENT_SYSTEM_PROMPT
from app.schemas.project_assessment import (
    ProjectRequirementAssessmentRequest,
    ProjectRequirementAssessmentResponse,
)
from app.services.json_completion import complete_json


class ProjectAssessmentError(Exception):
    pass


def assess_requirement(request: ProjectRequirementAssessmentRequest) -> ProjectRequirementAssessmentResponse:
    payload = request.model_dump()
    data = complete_json(
        REQUIREMENT_ASSESSMENT_SYSTEM_PROMPT,
        "Project data:\n" + json.dumps(payload, indent=2),
        settings.reasoning_model,
        temperature=0.2,
    )
    if data is None:
        raise ProjectAssessmentError("ai-service could not produce a valid requirement assessment")
    return ProjectRequirementAssessmentResponse(**data)
