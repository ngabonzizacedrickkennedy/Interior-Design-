import logging

from fastapi import APIRouter, HTTPException

from app.schemas.project_assessment import (
    ProjectRequirementAssessmentRequest,
    ProjectRequirementAssessmentResponse,
)
from app.services.project_complexity_pipeline import ProjectAssessmentError, assess_requirement

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/projects/requirement-assessment", response_model=ProjectRequirementAssessmentResponse)
def assess(request: ProjectRequirementAssessmentRequest):
    try:
        return assess_requirement(request)
    except ProjectAssessmentError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected failure while assessing project requirement")
        raise HTTPException(status_code=502, detail="ai-service could not assess the project requirement") from exc
