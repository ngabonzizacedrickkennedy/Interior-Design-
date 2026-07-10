from typing import Optional

from pydantic import BaseModel


class StageRequest(BaseModel):
    image_url: str
    style: str
    room_type: Optional[str] = None


class StageResponse(BaseModel):
    image_base64: str
