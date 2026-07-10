from typing import List, Optional

from pydantic import BaseModel, Field


class Dimensions(BaseModel):
    length_m: Optional[float] = None
    width_m: Optional[float] = None
    ceiling_height_m: Optional[float] = None
    spatial_notes: Optional[str] = None


class SpaceUsage(BaseModel):
    works_from_home: bool = False
    entertains_often: bool = False
    has_kids: bool = False
    has_pets: bool = False
    storage_needs: Optional[str] = None


class Lighting(BaseModel):
    window_direction: Optional[str] = None
    natural_light_level: Optional[str] = None
    artificial_lighting_notes: Optional[str] = None


class AttachmentIn(BaseModel):
    category: str
    url: str
    note: Optional[str] = None


class AssessRequest(BaseModel):
    request_id: int
    room_type: Optional[str] = None
    request_details: Optional[str] = None
    dimensions: Dimensions = Field(default_factory=Dimensions)
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    style_tags: List[str] = Field(default_factory=list)
    space_usage: SpaceUsage = Field(default_factory=SpaceUsage)
    lighting: Lighting = Field(default_factory=Lighting)
    timeline: Optional[str] = None
    avoid_notes: Optional[str] = None
    sourcing_location: Optional[str] = None
    attachments: List[AttachmentIn] = Field(default_factory=list)


class AssessResponse(BaseModel):
    verdict: str
    recommended_budget_min: float
    recommended_budget_max: float
    reasoning: str
    style_summary: str
    room_condition_summary: str


class VisualObservation(BaseModel):
    summary: str = ""
    key_observations: List[str] = Field(default_factory=list)
