from typing import List

from pydantic import BaseModel


class PortfolioFileIn(BaseModel):
    url: str


class PortfolioAnalyzeRequest(BaseModel):
    files: List[PortfolioFileIn]
    task_titles: List[str] = []


class PortfolioAnalyzeResponse(BaseModel):
    recommended_task_titles: List[str]
    reasoning: str
