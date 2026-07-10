from app.config import settings
from app.prompts.chat_prompt import CHAT_SYSTEM_PROMPT
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.groq_client import get_client


class ChatError(Exception):
    pass


def chat(request: ChatRequest) -> ChatResponse:
    client = get_client()

    messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    for m in request.history[-10:]:
        role = "assistant" if m.role == "assistant" else "user"
        messages.append({"role": role, "content": m.content})
    messages.append({"role": "user", "content": request.message})

    try:
        response = client.chat.completions.create(
            model=settings.reasoning_model,
            messages=messages,
            temperature=0.4,
            max_tokens=400,
        )
    except Exception as exc:
        raise ChatError(f"ai-service could not produce a chat reply: {exc}") from exc

    reply = response.choices[0].message.content
    if not reply or not reply.strip():
        raise ChatError("ai-service returned an empty chat reply")
    return ChatResponse(reply=reply.strip())
