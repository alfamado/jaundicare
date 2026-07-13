"""Retention cleanup for explicitly consented model-training images."""

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.db.models import ModelTrainingImage
from app.services.cloudinary_service import delete_image


def purge_expired_training_images(
    db: Session,
    retention_days: int,
    batch_size: int = 100,
) -> dict[str, int]:
    """Delete expired Cloudinary assets before deleting their database records.

    A failed remote deletion leaves its database record intact for a later retry;
    it never silently drops the deletion obligation.
    """
    if retention_days < 1:
        raise ValueError("retention_days must be at least one day")

    cutoff = datetime.utcnow() - timedelta(days=retention_days)
    candidates = (
        db.query(ModelTrainingImage)
        .filter(ModelTrainingImage.created_at < cutoff)
        .order_by(ModelTrainingImage.created_at.asc())
        .limit(batch_size)
        .all()
    )

    deleted = 0
    failed = 0
    try:
        for image in candidates:
            if not delete_image(image.cloudinary_public_id):
                failed += 1
                continue
            db.delete(image)
            deleted += 1
        if deleted:
            db.commit()
    except Exception:
        db.rollback()
        raise

    return {"deleted": deleted, "failed": failed, "examined": len(candidates)}
