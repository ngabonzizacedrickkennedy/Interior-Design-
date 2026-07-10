from typing import List, Optional

from pydantic import BaseModel


class InterviewQuestionsRequest(BaseModel):
    cv_url: str


class InterviewQuestionsResponse(BaseModel):
    questions: List[str]


class InterviewAnswer(BaseModel):
    question: str
    answer: Optional[str] = None


class InterviewScoreRequest(BaseModel):
    transcript: List[InterviewAnswer]


class InterviewScoreResponse(BaseModel):
    score: int
    reasoning: str
