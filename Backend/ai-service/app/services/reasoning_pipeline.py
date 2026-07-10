import json
import logging

from app.config import settings
from app.prompts.reasoning_prompt import REASONING_SYSTEM_PROMPT, build_reasoning_user_prompt
from app.schemas.assess import AssessRequest, AssessResponse, VisualObservation
from app.services.groq_client import get_client

logger = logging.getLogger(__name__)


class AssessmentGenerationError(Exception):
    pass


def reason_about_budget(request: AssessRequest, visual_observations: dict[str, VisualObservation]) -> AssessResponse:
    client = get_client()
    messages = [
        {"role": "system", "content": REASONING_SYSTEM_PROMPT},
        {"role": "user", "content": build_reasoning_user_prompt(request, visual_observations)},
    ]

    for attempt in range(2):
        response = client.chat.completions.create(
            model=settings.reasoning_model,
            messages=messages,
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        try:
            data = json.loads(content)
            return AssessResponse(**data)
        except Exception as exc:
            logger.warning("Reasoning pass produced invalid JSON (attempt %s): %s", attempt + 1, exc)
            messages = messages + [
                {"role": "assistant", "content": content or ""},
                {
                    "role": "user",
                    "content": "Your last reply was not valid JSON matching the required "
                    "schema. Reply again with ONLY a valid JSON object.",
                },
            ]

    raise AssessmentGenerationError("ai-service could not produce a valid assessment")
