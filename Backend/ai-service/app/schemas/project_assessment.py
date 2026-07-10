from typing import List, Optional

from pydantic import BaseModel


class ProjectRequirementAssessmentRequest(BaseModel):
    room_type: Optional[str] = None
    request_details: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    style_tags: List[str] = []
    timeline: Optional[str] = None
    length_m: Optional[float] = None
    width_m: Optional[float] = None
    ceiling_height_m: Optional[float] = None


class ProjectRequirementAssessmentResponse(BaseModel):
    recommended_mode: str
    complexity_score: int
    reasoning: str
