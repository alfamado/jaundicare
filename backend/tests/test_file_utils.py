import io
from pathlib import Path

import pytest
from fastapi import UploadFile
from PIL import Image
from starlette.datastructures import Headers

from app.utils import file_utils


def _image_bytes(size: tuple[int, int] = (16, 16), image_format: str = "JPEG") -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, color=(240, 220, 80)).save(buffer, format=image_format)
    return buffer.getvalue()


def _upload(data: bytes, filename: str = "photo.jpg", content_type: str = "image/jpeg"):
    return UploadFile(
        file=io.BytesIO(data),
        filename=filename,
        headers=Headers({"content-type": content_type}),
    )


@pytest.mark.asyncio
async def test_valid_image_uses_generated_filename(tmp_path: Path):
    destination = await file_utils.save_upload_file(
        _upload(_image_bytes(), filename="../../parent-name.jpg"),
        tmp_path,
    )

    assert destination.exists()
    assert destination.parent == tmp_path
    assert destination.name != "parent-name.jpg"
    assert destination.suffix == ".jpg"


@pytest.mark.asyncio
async def test_fake_image_is_rejected_and_removed(tmp_path: Path):
    with pytest.raises(file_utils.InvalidImageUpload):
        await file_utils.save_upload_file(
            _upload(b"this is not an encoded image"),
            tmp_path,
        )

    assert list(tmp_path.iterdir()) == []


@pytest.mark.asyncio
async def test_disallowed_content_type_is_rejected(tmp_path: Path):
    with pytest.raises(file_utils.InvalidImageUpload):
        await file_utils.save_upload_file(
            _upload(_image_bytes(), content_type="application/octet-stream"),
            tmp_path,
        )


@pytest.mark.asyncio
async def test_file_size_limit_is_enforced(tmp_path: Path, monkeypatch):
    monkeypatch.setattr(file_utils, "MAX_UPLOAD_BYTES", 32)
    with pytest.raises(file_utils.InvalidImageUpload, match="8 MB or smaller"):
        await file_utils.save_upload_file(
            _upload(_image_bytes()),
            tmp_path,
        )

    assert list(tmp_path.iterdir()) == []


@pytest.mark.asyncio
async def test_pixel_limit_is_enforced(tmp_path: Path, monkeypatch):
    monkeypatch.setattr(file_utils, "MAX_IMAGE_PIXELS", 100)
    with pytest.raises(file_utils.InvalidImageUpload, match="dimensions"):
        await file_utils.save_upload_file(
            _upload(_image_bytes(size=(11, 10))),
            tmp_path,
        )

    assert list(tmp_path.iterdir()) == []
