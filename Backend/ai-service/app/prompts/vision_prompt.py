from app.schemas.assess import AttachmentIn

VISION_SYSTEM_PROMPT = (
    "You are an interior design assistant analyzing photos uploaded by a client for a room "
    "renovation request. Look carefully at the images provided for a single category of the "
    "request (e.g. room photos, existing furniture, style references, or a floor plan). "
    "Reply with ONLY a JSON object of the form "
    '{"summary": "<2-4 sentence summary>", "key_observations": ["<short bullet>", ...]}. '
    "Do not include markdown fences or any text outside the JSON object."
)


def build_vision_user_content(category: str, attachments: list[AttachmentIn]) -> list[dict]:
    content: list[dict] = [
        {
            "type": "text",
            "text": (
                f"Category: {category}. Analyze the following {len(attachments)} image(s) "
                "and any accompanying notes."
            ),
        }
    ]
    for attachment in attachments:
        if attachment.note:
            content.append({"type": "text", "text": f"Note for next image: {attachment.note}"})
        content.append({"type": "image_url", "image_url": {"url": attachment.url}})
    return content
