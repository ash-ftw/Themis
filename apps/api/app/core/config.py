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
    object_storage_access_key: str = "themis"
    object_storage_secret_key: str = "themis-local-password"
    object_storage_presign_expires_seconds: int = 900
    document_max_file_size_bytes: int = 10 * 1024 * 1024

    auth_issuer: str | None = None
    auth_audience: str | None = None
    auth_jwks_url: str | None = None
    auth_token_use: str = "id"
    auth_role_claim: str = "custom:role"
    auth_admin_group: str = "admin"
    auth_lawyer_group: str = "lawyer"
    local_auth_enabled: bool = True
    admin_bootstrap_emails: list[str] = Field(
        default_factory=lambda: ["admin@themis.local"],
        description="Emails that should be promoted to admin during profile sync.",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
