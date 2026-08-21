"""Provision one ClinixTech partner project and print an API key once.

Run this only from a secure administrator machine. Do not paste the resulting
key into a mobile app, website, commit, or chat transcript.
"""

from __future__ import annotations

import argparse

from app.db.models import ClinixApiProject
from app.db.session import SessionLocal
from app.services.clinix_assist.partner_auth import create_api_key


ALLOWED_ASSISTANTS = {"newborn-care", "immunisation-ng"}


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a scoped Clinix API key")
    parser.add_argument("--name", required=True, help="Organisation or application name")
    parser.add_argument("--slug", required=True, help="Stable lowercase project slug")
    parser.add_argument(
        "--assistants",
        default="newborn-care",
        help="Comma-separated allowed assistants: newborn-care,immunisation-ng",
    )
    args = parser.parse_args()

    assistants = [item.strip() for item in args.assistants.split(",") if item.strip()]
    if not assistants or not set(assistants).issubset(ALLOWED_ASSISTANTS):
        raise SystemExit("--assistants must contain only newborn-care and/or immunisation-ng")

    db = SessionLocal()
    try:
        project = db.query(ClinixApiProject).filter(ClinixApiProject.slug == args.slug).one_or_none()
        if project is None:
            project = ClinixApiProject(
                name=args.name.strip(),
                slug=args.slug.strip().lower(),
                allowed_assistants=assistants,
            )
            db.add(project)
            db.commit()
            db.refresh(project)
        else:
            project.allowed_assistants = assistants
            project.is_active = True
            db.commit()

        api_key, raw_key = create_api_key(db, project=project)
    finally:
        db.close()

    print(f"Project: {args.slug}")
    print(f"Key prefix: {api_key.key_prefix}")
    print("Copy this secret now. It cannot be shown again:")
    print(raw_key)


if __name__ == "__main__":
    main()
