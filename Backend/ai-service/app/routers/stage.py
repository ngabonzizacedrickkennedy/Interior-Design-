import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.stage import StageRequest, StageResponse
from app.services.staging_pipeline import (
    StagingError,
    generate_staged_image,
    generate_staged_image_from_upload,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/stage/generate", response_model=StageResponse)
def generate(request: StageRequest):
    try:
        return generate_staged_image(request)
    except StagingError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected failure while generating staged image")
        raise HTTPException(status_code=502, detail="ai-service could not generate the staged image") from exc


@router.post("/stage/generate-upload", response_model=StageResponse)
async def generate_upload(
    style: str = Form(...),
    room_type: Optional[str] = Form(None),
    image: UploadFile = File(...),
):
    try:
        source_bytes = await image.read()
        return generate_staged_image_from_upload(source_bytes, style, room_type)
    except StagingError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected failure while generating staged image from upload")
        raise HTTPException(status_code=502, detail="ai-service could not generate the staged image") from exc
