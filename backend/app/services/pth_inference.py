"""CPU inference for the server-side PyTorch MobileNetV2 model.

The mobile application uses the quantised ONNX export offline. The API uses the
canonical ``.pth`` state dictionary so both paths can be validated against the
same model and class mapping.
"""

import json
from pathlib import Path

import torch
import torch.nn.functional as functional
from torch import nn
from torchvision import models

from app.config import CLASS_MAP_PATH, MODEL_PATH
from app.services.preprocessing import build_inference_transform, load_image


class JaundiceClassifier:
    def __init__(self, model_path: Path = MODEL_PATH):
        self.device = torch.device("cpu")
        self.model_loaded = False
        self.idx_to_class: dict[int, str] | None = None
        self.model = self._build_model()
        self.transform = build_inference_transform()

        self._load_class_map()
        self._load_weights(model_path)

    def _build_model(self) -> torch.nn.Module:
        model = models.mobilenet_v2(weights=None)
        model.classifier[1] = nn.Linear(model.last_channel, 2)
        return model.to(self.device)

    def _load_class_map(self) -> None:
        if not CLASS_MAP_PATH.exists():
            print("[JaundiceClassifier] WARNING: class mapping was not found.")
            return

        with CLASS_MAP_PATH.open("r", encoding="utf-8") as class_map_file:
            class_to_idx = json.load(class_map_file)

        if set(class_to_idx) != {"jaundice", "normal"}:
            print("[JaundiceClassifier] WARNING: class mapping is invalid.")
            return

        self.idx_to_class = {int(index): label for label, index in class_to_idx.items()}

    def _load_weights(self, model_path: Path) -> None:
        if not model_path.exists():
            print(f"[JaundiceClassifier] WARNING: model weights not found: {model_path}")
            return

        try:
            state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
            self.model.load_state_dict(state_dict)
            self.model.eval()
            self.model_loaded = True
            print(f"[JaundiceClassifier] Loaded PyTorch model: {model_path.name}")
        except (RuntimeError, ValueError, OSError) as error:
            print(f"[JaundiceClassifier] ERROR: unable to load model weights: {error}")

    def predict(self, image_path: str) -> dict:
        empty_result = {
            "prediction": None,
            "raw_prediction": None,
            "confidence": None,
            "confidence_percent": None,
            "confidence_band": None,
        }

        if not self.model_loaded:
            return {**empty_result, "status": "model_not_loaded"}
        if self.idx_to_class is None:
            return {**empty_result, "status": "class_mapping_not_loaded"}

        try:
            image = load_image(image_path)
            tensor = self.transform(image).unsqueeze(0).to(self.device)

            with torch.inference_mode():
                probabilities = functional.softmax(self.model(tensor), dim=1)[0]
                confidence_tensor, prediction_tensor = torch.max(probabilities, dim=0)

            prediction_index = int(prediction_tensor.item())
            confidence = float(confidence_tensor.item())
            raw_prediction = self.idx_to_class.get(prediction_index)
            if raw_prediction is None:
                return {**empty_result, "status": "unknown_class_index"}

            confidence_band = (
                "high" if confidence >= 0.75 else "moderate" if confidence >= 0.60 else "low"
            )
            return {
                "prediction": raw_prediction,
                "raw_prediction": raw_prediction,
                "confidence": round(confidence, 4),
                "confidence_percent": round(confidence * 100, 2),
                "confidence_band": confidence_band,
                "status": "ok",
            }
        except (OSError, RuntimeError, ValueError) as error:
            print(f"[JaundiceClassifier] Inference error: {error}")
            return {**empty_result, "status": "inference_error"}


# Loaded once at process startup and reused across requests.
classifier = JaundiceClassifier()
