import hmac
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from hashlib import sha256
from urllib.parse import quote, urlsplit, urlunsplit

from app.core.config import Settings


@dataclass(frozen=True)
class PresignedUrl:
    url: str
    expires_at: datetime


def presign_object_url(
    *,
    settings: Settings,
    method: str,
    object_key: str,
    expires_seconds: int | None = None,
) -> PresignedUrl:
    expires = expires_seconds or settings.object_storage_presign_expires_seconds
    now = datetime.now(UTC)
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = now.strftime("%Y%m%d")
    credential_scope = f"{date_stamp}/{settings.object_storage_region}/s3/aws4_request"
    endpoint = settings.object_storage_endpoint.rstrip("/")
    split_endpoint = urlsplit(endpoint)
    host = split_endpoint.netloc
    if not host:
        raise ValueError("Object storage endpoint must include a host.")

    canonical_uri = _canonical_uri(
        split_endpoint.path,
        settings.object_storage_bucket,
        object_key,
    )
    query_params = {
        "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
        "X-Amz-Credential": f"{settings.object_storage_access_key}/{credential_scope}",
        "X-Amz-Date": amz_date,
        "X-Amz-Expires": str(expires),
        "X-Amz-SignedHeaders": "host",
    }
    canonical_query = _canonical_query(query_params)
    canonical_request = "\n".join(
        [
            method.upper(),
            canonical_uri,
            canonical_query,
            f"host:{host}\n",
            "host",
            "UNSIGNED-PAYLOAD",
        ]
    )
    string_to_sign = "\n".join(
        [
            "AWS4-HMAC-SHA256",
            amz_date,
            credential_scope,
            sha256(canonical_request.encode()).hexdigest(),
        ]
    )
    signing_key = _signing_key(
        settings.object_storage_secret_key,
        date_stamp,
        settings.object_storage_region,
    )
    signature = hmac.new(signing_key, string_to_sign.encode(), sha256).hexdigest()
    final_query = f"{canonical_query}&X-Amz-Signature={signature}"

    url = urlunsplit(
        (
            split_endpoint.scheme,
            host,
            canonical_uri,
            final_query,
            "",
        )
    )
    return PresignedUrl(url=url, expires_at=now + timedelta(seconds=expires))


def _canonical_uri(endpoint_path: str, bucket: str, object_key: str) -> str:
    prefix = endpoint_path.strip("/")
    path_parts = [part for part in (prefix, bucket, object_key) if part]
    return "/" + "/".join(_quote_path(part) for part in "/".join(path_parts).split("/"))


def _canonical_query(params: dict[str, str]) -> str:
    pairs = [
        f"{quote(key, safe='')}={quote(value, safe='-_.~')}"
        for key, value in sorted(params.items())
    ]
    return "&".join(pairs)


def _quote_path(value: str) -> str:
    return quote(value, safe="-_.~")


def _signing_key(secret_key: str, date_stamp: str, region: str) -> bytes:
    date_key = _hmac(f"AWS4{secret_key}".encode(), date_stamp)
    date_region_key = _hmac(date_key, region)
    date_region_service_key = _hmac(date_region_key, "s3")
    return _hmac(date_region_service_key, "aws4_request")


def _hmac(key: bytes, message: str) -> bytes:
    return hmac.new(key, message.encode(), sha256).digest()
