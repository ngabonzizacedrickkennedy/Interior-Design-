import json
import logging

from app.config import settings
from app.prompts.vision_prompt import VISION_SYSTEM_PROMPT, build_vision_user_content
from app.schemas.assess import AttachmentIn, VisualObservation
from app.services.groq_client import get_client

logger = logging.getLogger(__name__)


def _complete_json(client, model: str, messages: list[dict]) -> dict | None:
    for _ in range(2):
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        try:
            return json.loads(content)
        except (json.JSONDecodeError, TypeError):
            messages = messages + [
                {"role": "assistant", "content": content or ""},
                {
                    "role": "user",
                    "content": "Your last reply was not valid JSON. Reply again with only a "
                    "valid JSON object, no markdown fences, no commentary.",
                },
            ]
    return None


def _call_vision_model(category: str, attachments: list[AttachmentIn]) -> VisualObservation:
    client = get_client()
    messages = [
        {"role": "system", "content": VISION_SYSTEM_PROMPT},
        {"role": "user", "content": build_vision_user_content(category, attachments)},
    ]

    raw = _complete_json(client, settings.vision_model, messages)
    if raw is None:
        return VisualObservation(summary=f"No usable analysis returned for {category}.")
    try:
        return VisualObservation(**raw)
    except Exception:
        return VisualObservation(summary=str(raw))


def analyze_by_category(attachments: list[AttachmentIn]) -> dict[str, VisualObservation]:
    by_category: dict[str, list[AttachmentIn]] = {}
    for attachment in attachments:
        by_category.setdefault(attachment.category, []).append(attachment)

    observations: dict[str, VisualObservation] = {}
    for category, items in by_category.items():
        try:
            observations[category] = _call_vision_model(category, items)
        except Exception as exc:
            logger.warning("Vision pass failed for category %s: %s", category, exc)
            observations[category] = VisualObservation(summary=f"Vision analysis unavailable for {category}.")
    return observations
