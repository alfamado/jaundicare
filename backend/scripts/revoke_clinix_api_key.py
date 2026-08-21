"""Revoke a ClinixTech partner key by its non-secret prefix.

Create a replacement key first, update the partner's server, verify it, then
run this command. Revocation is immediate for new requests.
"""

from __future__ import annotations

import argparse

from app.db.models import ClinixApiKey
from app.db.session import SessionLocal


def main() -> None:
    parser = argparse.ArgumentParser(description="Revoke a Clinix API key")
    parser.add_argument("--prefix", required=True, help="Key prefix, e.g. cxt_live_ab12cd34ef56")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        api_key = (
            db.query(ClinixApiKey)
            .filter(ClinixApiKey.key_prefix == args.prefix.strip())
            .one_or_none()
        )
        if api_key is None:
            raise SystemExit("No API key was found for that prefix.")
        if not api_key.is_active:
            print("Key is already revoked.")
            return

        api_key.is_active = False
        db.commit()
    finally:
        db.close()

    print("Key revoked.")


if __name__ == "__main__":
    main()
