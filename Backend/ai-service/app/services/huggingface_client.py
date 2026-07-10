from huggingface_hub import InferenceClient

from app.config import settings

_client: InferenceClient | None = None


def get_client() -> InferenceClient:
    global _client
    if _client is None:
        _client = InferenceClient(api_key=settings.huggingface_api_key)
    return _client
