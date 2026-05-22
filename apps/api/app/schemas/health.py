from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str


class ReadinessCheck(BaseModel):
    status: str
    detail: str | None = None


class ReadinessResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    checks: dict[str, ReadinessCheck]
