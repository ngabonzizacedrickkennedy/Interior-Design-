from typing import Optional

from pydantic import BaseModel


class CvAnalyzeRequest(BaseModel):
    cv_url: str


class CvAnalyzeResponse(BaseModel):
    is_cv: bool
    strength_score: Optional[int] = None
    reasoning: str


class CandidateSummaryRequest(BaseModel):
    cv_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    other_link_url: Optional[str] = None


class CandidateSummaryResponse(BaseModel):
    summary: str
