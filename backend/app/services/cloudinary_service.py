"""
JaundiCare — Cloudinary Service
Handles all image uploads for screening and model training.
Every image uploaded through JaundiCare is stored permanently
in Cloudinary so it can be used for model retraining later.
"""

import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

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
    Upload a screening image to Cloudinary.

    Returns:
        {
            "url": "https://res.cloudinary.com/...",
            "public_id": "jaundicare/screenings/...",
            "width": 1080,
            "height": 1080,
        }

    Images are organised in folders by month for easy management:
        jaundicare/screenings/2025-06/<screening_id>

    Tags are added so the ML team can filter by skin tone and triage level
    when pulling images for labelling.
    """
    import datetime
    month_folder = datetime.datetime.utcnow().strftime("%Y-%m")
    public_id    = f"jaundicare/screenings/{month_folder}/{screening_id}"

    tags = ["screening"]
    if skin_tone:
        tags.append(f"skin_{skin_tone}")
    if triage_level:
        tags.append(f"triage_{triage_level.lower()}")

    result = cloudinary.uploader.upload(
        file_path,
        public_id       = public_id,
        folder          = None,     # public_id already includes folder
        overwrite       = True,
        resource_type   = "image",
        tags            = tags,
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
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
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
    tag = "screening"
    if skin_tone:
        tag = f"skin_{skin_tone}"
    elif triage_level:
        tag = f"triage_{triage_level.lower()}"

    result = cloudinary.api.resources_by_tag(
        tag,
        max_results = limit,
        resource_type = "image",
    )

    return result.get("resources", [])