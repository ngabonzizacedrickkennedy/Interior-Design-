import logging

from fastapi import APIRouter, HTTPException

from app.schemas.assess import AssessRequest, AssessResponse
from app.services.orchestrator import run_assessment
from app.services.reasoning_pipeline import AssessmentGenerationError

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/assess", response_model=AssessResponse)
def assess(request: AssessRequest):
    try:
        return run_assessment(request)
    except AssessmentGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected failure while running assessment for request %s", request.request_id)
        raise HTTPException(status_code=502, detail="ai-service could not produce a valid assessment") from exc
