from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    groq_api_key: str = ""
    vision_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    reasoning_model: str = "llama-3.3-70b-versatile"
    huggingface_api_key: str = ""
    image_model: str = "black-forest-labs/FLUX.1-Kontext-dev"
    port: int = 8000

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
