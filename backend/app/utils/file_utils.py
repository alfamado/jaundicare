"""Safe handling for untrusted screening image uploads."""

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError


MAX_UPLOAD_BYTES = 8 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
CHUNK_SIZE = 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_IMAGE_FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}


class InvalidImageUpload(ValueError):
    """Raised when an upload is not a permitted, safe-to-process image."""


def safe_original_filename(filename: str | None) -> str:
    """Strip path components before retaining an optional display filename."""
    return Path(filename or "image").name[:255] or "image"


async def save_upload_file(upload_file: UploadFile, upload_dir: Path) -> Path:
    """Stream, size-limit, and decode-verify an image before inference.

    The client filename and MIME type are not trusted. Files are stored under a
    generated name, then Pillow verifies the actual encoded image before it is
    handed to the model or any cloud-storage integration.
    """
    if upload_file.content_type not in ALLOWED_CONTENT_TYPES:
        raise InvalidImageUpload("Upload a JPEG, PNG, or WebP image.")

    upload_dir.mkdir(parents=True, exist_ok=True)
    temporary_path = upload_dir / f"{uuid4().hex}.upload"
    bytes_written = 0

    try:
        with temporary_path.open("wb") as target:
            while chunk := await upload_file.read(CHUNK_SIZE):
                bytes_written += len(chunk)
                if bytes_written > MAX_UPLOAD_BYTES:
                    raise InvalidImageUpload("Image must be 8 MB or smaller.")
                target.write(chunk)

        if bytes_written == 0:
            raise InvalidImageUpload("The uploaded image is empty.")

        with Image.open(temporary_path) as image:
            if image.width * image.height > MAX_IMAGE_PIXELS:
                raise InvalidImageUpload("Image dimensions are too large to process safely.")
            image_format = image.format
            image.verify()

        extension = ALLOWED_IMAGE_FORMATS.get(image_format or "")
        if not extension:
            raise InvalidImageUpload("Upload a valid JPEG, PNG, or WebP image.")

        destination = temporary_path.with_suffix(extension)
        temporary_path.replace(destination)
        return destination
    except (Image.DecompressionBombError, UnidentifiedImageError, OSError) as error:
        raise InvalidImageUpload("Upload a valid image that is safe to process.") from error
    finally:
        if temporary_path.exists():
            temporary_path.unlink(missing_ok=True)
