from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from math import ceil
from time import monotonic
from typing import Any

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse, Response
from starlette.types import ASGIApp


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    retry_after_seconds: int


class FixedWindowRateLimiter:
    def __init__(self, *, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = {}

    def check(self, key: str, now: float | None = None) -> RateLimitDecision:
        if self.limit <= 0:
            return RateLimitDecision(allowed=True, retry_after_seconds=0)

        timestamp = monotonic() if now is None else now
        hits = self._hits.setdefault(key, deque())
        cutoff = timestamp - self.window_seconds

        while hits and hits[0] <= cutoff:
            hits.popleft()

        if len(hits) >= self.limit:
            oldest_hit = hits[0]
            retry_after = max(1, ceil(self.window_seconds - (timestamp - oldest_hit)))
            return RateLimitDecision(allowed=False, retry_after_seconds=retry_after)

        hits.append(timestamp)
        return RateLimitDecision(allowed=True, retry_after_seconds=0)


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
        *,
        enabled: bool,
        limit: int,
        window_seconds: int,
        exempt_paths: tuple[str, ...] = ("/health", "/api/v1/health", "/docs", "/redoc"),
    ) -> None:
        super().__init__(app)
        self.enabled = enabled
        self.exempt_paths = exempt_paths
        self.limiter = FixedWindowRateLimiter(limit=limit, window_seconds=window_seconds)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if not self.enabled or request.method == "OPTIONS" or self._is_exempt(request.url.path):
            return await call_next(request)

        decision = self.limiter.check(self._key_for_request(request))
        if decision.allowed:
            return await call_next(request)

        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please retry shortly."},
            headers={"Retry-After": str(decision.retry_after_seconds)},
        )

    def _is_exempt(self, path: str) -> bool:
        return any(path == exempt or path.startswith(f"{exempt}/") for exempt in self.exempt_paths)

    @staticmethod
    def _key_for_request(request: Request) -> str:
        forwarded_for = request.headers.get("x-forwarded-for")
        client_host = forwarded_for.split(",", maxsplit=1)[0].strip() if forwarded_for else None
        if not client_host and request.client is not None:
            client_host = request.client.host

        return f"{client_host or 'unknown'}:{request.url.path}"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        headers: dict[str, Any] = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Referrer-Policy": "no-referrer",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        }
        for header, value in headers.items():
            response.headers.setdefault(header, value)
        return response
