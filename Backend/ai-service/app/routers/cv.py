import logging

from fastapi import APIRouter, HTTPException

from app.schemas.cv import CandidateSummaryRequest, CandidateSummaryResponse, CvAnalyzeRequest, CvAnalyzeResponse
from app.services.cv_pipeline import CvAnalysisError, analyze_cv, summarize_candidate

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/cv/analyze", response_model=CvAnalyzeResponse)
def analyze(request: CvAnalyzeRequest):
    try:
        return analyze_cv(request)
    except CvAnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected failure while analyzing CV")
        raise HTTPException(status_code=502, detail="ai-service could not analyze the CV") from exc


@router.post("/designers/summary", response_model=CandidateSummaryResponse)
def summary(request: CandidateSummaryRequest):
    try:
        return summarize_candidate(request)
    except CvAnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected failure while summarizing candidate")
        raise HTTPException(status_code=502, detail="ai-service could not summarize the candidate") from exc
