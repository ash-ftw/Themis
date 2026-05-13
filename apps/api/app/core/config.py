from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Themis API"
    app_version: str = "0.1.0"
    environment: str = "local"
    enable_docs: bool = True
    api_v1_prefix: str = "/api/v1"

    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    database_url: str = "postgresql+psycopg://themis:themis@localhost:5432/themis"
    redis_url: str = "redis://localhost:6379/0"
    rabbitmq_url: str = "amqp://themis:themis@localhost:5672//"

    object_storage_endpoint: str = "http://localhost:9000"
    object_storage_bucket: str = "themis-documents"
    object_storage_region: str = "ap-south-1"

    auth_issuer: str | None = None
    auth_audience: str | None = None
    local_auth_enabled: bool = True
    admin_bootstrap_emails: list[str] = Field(
        default_factory=lambda: ["admin@themis.local"],
        description="Emails that should be promoted to admin during profile sync.",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
