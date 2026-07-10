import json
import logging

from app.services.groq_client import get_client

logger = logging.getLogger(__name__)


def complete_json(system_prompt: str, user_content, model: str, temperature: float = 0.2, retries: int = 2) -> dict | None:
    client = get_client()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content},
    ]

    for attempt in range(retries):
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        try:
            return json.loads(content)
        except (json.JSONDecodeError, TypeError) as exc:
            logger.warning("JSON completion attempt %s produced invalid JSON: %s", attempt + 1, exc)
            messages = messages + [
                {"role": "assistant", "content": content or ""},
                {
                    "role": "user",
                    "content": "Your last reply was not valid JSON. Reply again with ONLY a valid "
                    "JSON object, no markdown fences, no commentary.",
                },
            ]
    return None
