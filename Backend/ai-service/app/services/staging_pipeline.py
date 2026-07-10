import base64
import io
import logging

import httpx

from app.config import settings
from app.schemas.stage import StageRequest, StageResponse
from app.services.huggingface_client import get_client

logger = logging.getLogger(__name__)


class StagingError(Exception):
    pass


def _humanize(style: str) -> str:
    return style.replace("_", " ").strip().title()


def _build_prompt(style: str, room_type: str | None) -> str:
    room = room_type.replace("_", " ").lower() if room_type else "room"
    style_label = _humanize(style)
    return (
        f"Virtually stage and redesign this {room} photo in a {style_label} interior "
        "design style. Keep the room's architecture, walls, windows, doors, floor layout, "
        "and camera perspective exactly unchanged. Add tasteful, realistic furniture, "
        "textiles, and decor appropriate for the style. Correct lighting so the result "
        "looks like a professionally shot, photorealistic real estate photo."
    )


def _generate_from_bytes(source_bytes: bytes, style: str, room_type: str | None) -> StageResponse:
    prompt = _build_prompt(style, room_type)

    try:
        client = get_client()
        result_image = client.image_to_image(
            source_bytes,
            prompt=prompt,
            model=settings.image_model,
        )
    except Exception as exc:
        logger.exception("Hugging Face image-to-image generation failed")
        raise StagingError(f"image generation failed: {exc}") from exc

    buffer = io.BytesIO()
    result_image.save(buffer, format="PNG")
    return StageResponse(image_base64=base64.b64encode(buffer.getvalue()).decode("utf-8"))


def generate_staged_image(request: StageRequest) -> StageResponse:
    try:
        source_bytes = httpx.get(request.image_url, timeout=30.0).content
    except httpx.HTTPError as exc:
        raise StagingError(f"could not download the source photo: {exc}") from exc

    return _generate_from_bytes(source_bytes, request.style, request.room_type)


def generate_staged_image_from_upload(source_bytes: bytes, style: str, room_type: str | None) -> StageResponse:
    return _generate_from_bytes(source_bytes, style, room_type)
