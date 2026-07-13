"""Run the configured training-image retention cleanup once."""

import os

from app.db.session import SessionLocal
from app.services.retention_service import purge_expired_training_images


def main() -> None:
    try:
        retention_days = int(os.getenv("TRAINING_IMAGE_RETENTION_DAYS", "30"))
    except ValueError as error:
        raise SystemExit("TRAINING_IMAGE_RETENTION_DAYS must be a whole number.") from error

    db = SessionLocal()
    try:
        result = purge_expired_training_images(db, retention_days=retention_days)
    finally:
        db.close()

    print(
        "Training-image retention cleanup: "
        f"examined={result['examined']} deleted={result['deleted']} failed={result['failed']}"
    )


if __name__ == "__main__":
    main()
