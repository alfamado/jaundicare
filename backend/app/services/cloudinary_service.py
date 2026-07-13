"""
JaundiCare — Cloudinary Service
Handles opt-in model-training image uploads.

Screening images are not uploaded by default. This service is only called
after explicit training-use consent has been recorded with the screening.
"""

import os
import logging
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Configure Cloudinary from environment variables
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key    = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure     = True,
)


def upload_screening_image(
    file_path: str,
    screening_id: str,
    skin_tone: str = None,
    triage_level: str = None,
) -> dict:
    """
    Upload a consented screening image to authenticated Cloudinary storage.

    Returns:
        {
            "url": "https://res.cloudinary.com/...",
            "public_id": "jaundicare/screenings/...",
            "width": 1080,
            "height": 1080,
        }

    Images are organised in folders by month for easy management:
        jaundicare/screenings/2025-06/<screening_id>

    The asset is authenticated rather than publicly retrievable. Clinical
    metadata is retained in PostgreSQL rather than being exposed as tags.
    """
    import datetime
    month_folder = datetime.datetime.utcnow().strftime("%Y-%m")
    public_id    = f"jaundicare/screenings/{month_folder}/{screening_id}"

    result = cloudinary.uploader.upload(
        file_path,
        public_id       = public_id,
        folder          = None,     # public_id already includes folder
        overwrite       = True,
        resource_type   = "image",
        type            = "authenticated",
        tags            = ["training-consent"],
        # Store original quality — important for model training
        quality         = "auto:best",
        # Generate a 300px thumbnail for fast preview
        eager           = [{"width": 300, "height": 300, "crop": "fill"}],
        eager_async     = True,
    )

    return {
        "url":       result["secure_url"],
        "public_id": result["public_id"],
        "width":     result.get("width"),
        "height":    result.get("height"),
    }


def delete_image(public_id: str) -> bool:
    """Delete an image from Cloudinary. Used for GDPR/data deletion requests."""
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="image",
            type="authenticated",
            invalidate=True,
        )
        return result.get("result") in {"ok", "not found"}
    except Exception:
        logger.exception("Cloudinary image deletion failed")
        return False


def get_training_images(
    skin_tone: str = None,
    triage_level: str = None,
    labelled_only: bool = False,
    limit: int = 100,
) -> list:
    """
    Query Cloudinary for screening images by tag.
    Used by the ML pipeline to pull images for model retraining.
    """
    # All stored assets carry exactly one non-clinical tag. Clinical filters
    # belong in PostgreSQL so they are not exposed through asset metadata.
    tag = "training-consent"

    result = cloudinary.api.resources_by_tag(
        tag,
        max_results = limit,
        resource_type = "image",
        type = "authenticated",
    )

    return result.get("resources", [])
