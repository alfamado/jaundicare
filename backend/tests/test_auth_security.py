from starlette.requests import Request

from app.routes import auth


def _request(client: str, forwarded_for: str | None = None) -> Request:
    headers = []
    if forwarded_for:
        headers.append((b"x-forwarded-for", forwarded_for.encode("ascii")))
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/auth/request-otp",
            "headers": headers,
            "client": (client, 12345),
            "server": ("testserver", 80),
            "scheme": "http",
            "query_string": b"",
        }
    )


def test_client_fingerprint_is_pseudonymous(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_SALT", "test-only-secret")
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "false")

    fingerprint = auth._client_fingerprint(_request("192.0.2.10"))

    assert fingerprint != "192.0.2.10"
    assert len(fingerprint) == 64
    assert fingerprint == auth._client_fingerprint(_request("192.0.2.10"))


def test_forwarded_header_requires_explicit_trust(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_SALT", "test-only-secret")
    request = _request("10.0.0.5", forwarded_for="198.51.100.20")

    monkeypatch.setenv("TRUST_PROXY_HEADERS", "false")
    direct_fingerprint = auth._client_fingerprint(request)
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    forwarded_fingerprint = auth._client_fingerprint(request)

    assert direct_fingerprint != forwarded_fingerprint
