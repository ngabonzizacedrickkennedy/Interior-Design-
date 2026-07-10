import logging

from fastapi import APIRouter, HTTPException

from app.schemas.portfolio import PortfolioAnalyzeRequest, PortfolioAnalyzeResponse
from app.services.portfolio_pipeline import PortfolioAnalysisError, analyze_portfolio

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/portfolio/analyze", response_model=PortfolioAnalyzeResponse)
def analyze(request: PortfolioAnalyzeRequest):
    try:
        return analyze_portfolio(request)
    except PortfolioAnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected failure while analyzing portfolio")
        raise HTTPException(status_code=502, detail="ai-service could not analyze the portfolio") from exc
