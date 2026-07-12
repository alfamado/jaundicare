# from pathlib import Path
# import torch
# import torch.nn.functional as F
# from torchvision import models
# from torch import nn
# import json

# from app.config import MODEL_PATH, CLASS_NAMES
# from app.services.preprocessing import build_inference_transform, load_image


# class JaundiceClassifier:
#     def __init__(self, model_path: Path):
#         self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#         self.model = self._build_model()
#         self.transform = build_inference_transform()
#         self.model_loaded = False

#         if model_path.exists():
#             # state_dict = torch.load(model_path, map_location=self.device)
#             state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
#             self.model.load_state_dict(state_dict)
#             self.model.eval()
#             self.model_loaded = True

#     def _build_model(self):
#         model = models.mobilenet_v2(weights=None)
#         model.classifier[1] = nn.Linear(model.last_channel, 2)
#         model.to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))
#         return model

#     def predict(self, image_path: str) -> dict:
#         if not self.model_loaded:
#             return {
#                 "prediction": None,
#                 "confidence": None,
#                 "status": "model_not_loaded"
#             }

#         image = load_image(image_path)
#         tensor = self.transform(image).unsqueeze(0).to(self.device)

#         with torch.no_grad():
#             outputs = self.model(tensor)
#             probs = F.softmax(outputs, dim=1)
#             confidence, pred_idx = torch.max(probs, dim=1)

#         pred_idx = pred_idx.item()
#         confidence = float(confidence.item())

#         return {
#             "prediction": CLASS_NAMES[pred_idx],
#             "confidence": round(confidence, 4),
#             "status": "ok"
#         }


# classifier = JaundiceClassifier(MODEL_PATH)


# from pathlib import Path
# import json
# import torch
# import torch.nn.functional as F
# from torchvision import models
# from torch import nn

# from app.config import MODEL_PATH, CLASS_MAP_PATH
# from app.services.preprocessing import build_inference_transform, load_image


# class JaundiceClassifier:
#     def __init__(self, model_path: Path):
#         self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#         self.model = self._build_model()
#         self.transform = build_inference_transform()
#         self.model_loaded = False
#         self.idx_to_class = None

#         if CLASS_MAP_PATH.exists():
#             with open(CLASS_MAP_PATH, "r", encoding="utf-8") as f:
#                 class_to_idx = json.load(f)
#             self.idx_to_class = {idx: cls for cls, idx in class_to_idx.items()}

#         if model_path.exists():
#             state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
#             self.model.load_state_dict(state_dict)
#             self.model.eval()
#             self.model_loaded = True

#     def _build_model(self):
#         model = models.mobilenet_v2(weights=None)
#         model.classifier[1] = nn.Linear(model.last_channel, 2)
#         model.to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))
#         return model

#     def predict(self, image_path: str) -> dict:
#         if not self.model_loaded:
#             return {
#                 "prediction": None,
#                 "confidence": None,
#                 "status": "model_not_loaded"
#             }

#         if self.idx_to_class is None:
#             return {
#                 "prediction": None,
#                 "confidence": None,
#                 "status": "class_mapping_not_loaded"
#             }

#         image = load_image(image_path)
#         tensor = self.transform(image).unsqueeze(0).to(self.device)

#         with torch.no_grad():
#             outputs = self.model(tensor)
#             probs = F.softmax(outputs, dim=1)
#             confidence, pred_idx = torch.max(probs, dim=1)

#         pred_idx = pred_idx.item()
#         confidence = float(confidence.item())
#         pred_class = self.idx_to_class[pred_idx]

#         return {
#             "prediction": pred_class,
#             "confidence": round(confidence, 4),
#             "status": "ok"
#         }


# classifier = JaundiceClassifier(MODEL_PATH)




# from pathlib import Path
# import json
# import torch
# import torch.nn.functional as F
# from torchvision import models
# from torch import nn

# from app.config import (
#     MODEL_PATH,
#     CLASS_MAP_PATH,
#     UNCERTAIN_THRESHOLD,
#     STRONG_CONFIDENCE_THRESHOLD
# )
# from app.services.preprocessing import build_inference_transform, load_image


# class JaundiceClassifier:
#     def __init__(self, model_path: Path):
#         self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#         self.model = self._build_model()
#         self.transform = build_inference_transform()
#         self.model_loaded = False
#         self.idx_to_class = None

#         if CLASS_MAP_PATH.exists():
#             with open(CLASS_MAP_PATH, "r", encoding="utf-8") as f:
#                 class_to_idx = json.load(f)
#             self.idx_to_class = {idx: cls for cls, idx in class_to_idx.items()}

#         if model_path.exists():
#             state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
#             self.model.load_state_dict(state_dict)
#             self.model.eval()
#             self.model_loaded = True

#     def _build_model(self):
#         model = models.mobilenet_v2(weights=None)
#         model.classifier[1] = nn.Linear(model.last_channel, 2)
#         model.to(self.device)
#         return model

#     def predict(self, image_path: str) -> dict:
#         if not self.model_loaded:
#             return {
#                 "prediction": None,
#                 "confidence": None,
#                 "confidence_band": None,
#                 "status": "model_not_loaded"
#             }

#         if self.idx_to_class is None:
#             return {
#                 "prediction": None,
#                 "confidence": None,
#                 "confidence_band": None,
#                 "status": "class_mapping_not_loaded"
#             }

#         image = load_image(image_path)
#         tensor = self.transform(image).unsqueeze(0).to(self.device)

#         with torch.no_grad():
#             outputs = self.model(tensor)
#             probs = F.softmax(outputs, dim=1)
#             confidence, pred_idx = torch.max(probs, dim=1)

#         pred_idx = pred_idx.item()
#         confidence = float(confidence.item())
#         pred_class = self.idx_to_class[pred_idx]

#         if confidence < UNCERTAIN_THRESHOLD:
#             prediction = "uncertain"
#             confidence_band = "low"
#         elif confidence < STRONG_CONFIDENCE_THRESHOLD:
#             prediction = pred_class
#             confidence_band = "moderate"
#         else:
#             prediction = pred_class
#             confidence_band = "high"

#         return {
#             "prediction": prediction,
#             "raw_prediction": pred_class,
#             "confidence": round(confidence, 4),
#             "confidence_band": confidence_band,
#             "status": "ok"
#         }


# classifier = JaundiceClassifier(MODEL_PATH)


# from pathlib import Path
# import json
# import torch
# import torch.nn.functional as F
# from torchvision import models
# from torch import nn

# from app.config import (
#     MODEL_PATH,
#     CLASS_MAP_PATH,
#     MODEL_JAUNDICE_THRESHOLD,
#     MODEL_UNCERTAIN_MARGIN
# )
# from app.services.preprocessing import build_inference_transform, load_image


# class JaundiceClassifier:
#     def __init__(self, model_path: Path):
#         self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#         self.model = self._build_model()
#         self.transform = build_inference_transform()
#         self.model_loaded = False
#         self.idx_to_class = None
#         self.jaundice_idx = None
#         self.normal_idx = None

#         # Load class mapping
#         if CLASS_MAP_PATH.exists():
#             with open(CLASS_MAP_PATH, "r", encoding="utf-8") as f:
#                 class_to_idx = json.load(f)

#             self.idx_to_class = {idx: cls for cls, idx in class_to_idx.items()}

#             self.jaundice_idx = class_to_idx.get("jaundice")
#             self.normal_idx = class_to_idx.get("normal")

#         # Load trained model weights
#         if model_path.exists():
#             state_dict = torch.load(
#                 model_path,
#                 map_location=self.device,
#                 weights_only=True
#             )
#             self.model.load_state_dict(state_dict)
#             self.model.eval()
#             self.model_loaded = True

#     def _build_model(self):
#         model = models.mobilenet_v2(weights=None)
#         model.classifier[1] = nn.Linear(model.last_channel, 2)
#         model.to(self.device)
#         return model

#     def predict(self, image_path: str) -> dict:
#         if not self.model_loaded:
#             return {
#                 "prediction": None,
#                 "raw_prediction": None,
#                 "confidence": None,
#                 "confidence_percent": None,
#                 "confidence_band": None,
#                 "jaundice_probability": None,
#                 "status": "model_not_loaded"
#             }

#         if self.idx_to_class is None or self.jaundice_idx is None or self.normal_idx is None:
#             return {
#                 "prediction": None,
#                 "raw_prediction": None,
#                 "confidence": None,
#                 "confidence_percent": None,
#                 "confidence_band": None,
#                 "jaundice_probability": None,
#                 "status": "class_mapping_not_loaded"
#             }

#         image = load_image(image_path)
#         tensor = self.transform(image).unsqueeze(0).to(self.device)

#         with torch.no_grad():
#             outputs = self.model(tensor)
#             probs = F.softmax(outputs, dim=1)[0]

#         jaundice_prob = float(probs[self.jaundice_idx].item())
#         normal_prob = float(probs[self.normal_idx].item())

#         raw_prediction = "jaundice" if jaundice_prob >= normal_prob else "normal"

#         # Threshold-based classification
#         if jaundice_prob >= MODEL_JAUNDICE_THRESHOLD:
#             prediction = "jaundice"
#         elif abs(jaundice_prob - MODEL_JAUNDICE_THRESHOLD) <= MODEL_UNCERTAIN_MARGIN:
#             prediction = "uncertain"
#         else:
#             prediction = "normal"

#         # Confidence band based on jaundice probability
#         if jaundice_prob >= 0.75:
#             confidence_band = "high"
#         elif jaundice_prob >= 0.60:
#             confidence_band = "moderate"
#         else:
#             confidence_band = "low"

#         # Confidence shown to user:
#         # - if prediction is jaundice, confidence = jaundice probability
#         # - if prediction is normal, confidence = normal probability
#         # - if uncertain, still show jaundice probability as main screening risk signal
#         if prediction == "jaundice":
#             display_confidence = jaundice_prob
#         elif prediction == "normal":
#             display_confidence = normal_prob
#         else:
#             display_confidence = jaundice_prob

#         return {
#             "prediction": prediction,
#             "raw_prediction": raw_prediction,
#             "confidence": round(display_confidence, 4),
#             "confidence_percent": round(display_confidence * 100, 2),
#             "confidence_band": confidence_band,
#             "jaundice_probability": round(jaundice_prob, 4),
#             "status": "ok"
#         }


# classifier = JaundiceClassifier(MODEL_PATH)



# from pathlib import Path
# import json
# import torch
# import torch.nn.functional as F
# from torchvision import models
# from torch import nn

# from app.config import (
#     MODEL_PATH,
#     CLASS_MAP_PATH,
#     MODEL_JAUNDICE_THRESHOLD,
#     MODEL_UNCERTAIN_MARGIN
# )
# from app.services.preprocessing import build_inference_transform, load_image


# class JaundiceClassifier:
#     def __init__(self, model_path: Path):
#         self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#         self.model = self._build_model()
#         self.transform = build_inference_transform()
#         self.model_loaded = False
#         self.idx_to_class = None
#         self.jaundice_idx = None
#         self.normal_idx = None

#         if CLASS_MAP_PATH.exists():
#             with open(CLASS_MAP_PATH, "r", encoding="utf-8") as f:
#                 class_to_idx = json.load(f)

#             self.idx_to_class = {idx: cls for cls, idx in class_to_idx.items()}
#             self.jaundice_idx = class_to_idx.get("jaundice")
#             self.normal_idx = class_to_idx.get("normal")

#         if model_path.exists():
#             state_dict = torch.load(
#                 model_path,
#                 map_location=self.device,
#                 weights_only=True
#             )
#             self.model.load_state_dict(state_dict)
#             self.model.eval()
#             self.model_loaded = True

#     def _build_model(self):
#         model = models.mobilenet_v2(weights=None)
#         model.classifier[1] = nn.Linear(model.last_channel, 2)
#         model.to(self.device)
#         return model

#     def predict(self, image_path: str) -> dict:
#         if not self.model_loaded:
#             return {
#                 "prediction": None,
#                 "raw_prediction": None,
#                 "confidence": None,
#                 "confidence_percent": None,
#                 "confidence_band": None,
#                 "jaundice_probability": None,
#                 "status": "model_not_loaded"
#             }

#         if self.idx_to_class is None or self.jaundice_idx is None or self.normal_idx is None:
#             return {
#                 "prediction": None,
#                 "raw_prediction": None,
#                 "confidence": None,
#                 "confidence_percent": None,
#                 "confidence_band": None,
#                 "jaundice_probability": None,
#                 "status": "class_mapping_not_loaded"
#             }

#         image = load_image(image_path)
#         tensor = self.transform(image).unsqueeze(0).to(self.device)

#         with torch.no_grad():
#             outputs = self.model(tensor)
#             probs = F.softmax(outputs, dim=1)[0]

#         jaundice_prob = float(probs[self.jaundice_idx].item())
#         normal_prob = float(probs[self.normal_idx].item())

#         raw_prediction = "jaundice" if jaundice_prob >= normal_prob else "normal"

#         # Final threshold-based prediction
#         if jaundice_prob >= MODEL_JAUNDICE_THRESHOLD:
#             prediction = "jaundice"
#         elif abs(jaundice_prob - MODEL_JAUNDICE_THRESHOLD) <= MODEL_UNCERTAIN_MARGIN:
#             prediction = "uncertain"
#         else:
#             prediction = "normal"

#         # Confidence band should reflect jaundice risk level
#         if jaundice_prob >= 0.75:
#             confidence_band = "high"
#         elif jaundice_prob >= 0.60:
#             confidence_band = "moderate"
#         else:
#             confidence_band = "low"

#         # Display confidence based on final prediction
#         if prediction == "jaundice":
#             display_confidence = jaundice_prob
#         elif prediction == "normal":
#             display_confidence = normal_prob
#         else:
#             display_confidence = max(jaundice_prob, normal_prob)

#         return {
#             "prediction": prediction,
#             "raw_prediction": raw_prediction,
#             "confidence": round(display_confidence, 4),
#             "confidence_percent": round(display_confidence * 100, 2),
#             "confidence_band": confidence_band,
#             "jaundice_probability": round(jaundice_prob, 4),
#             "status": "ok"
#         }


# classifier = JaundiceClassifier(MODEL_PATH)


# from pathlib import Path
# import json
# import torch
# import torch.nn.functional as F
# from torchvision import models
# from torch import nn

# from app.config import MODEL_PATH, CLASS_MAP_PATH
# from app.services.preprocessing import build_inference_transform, load_image


# class JaundiceClassifier:
#     def __init__(self, model_path: Path):
#         self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#         self.model = self._build_model()
#         self.transform = build_inference_transform()
#         self.model_loaded = False
#         self.idx_to_class = None

#         if CLASS_MAP_PATH.exists():
#             with open(CLASS_MAP_PATH, "r", encoding="utf-8") as f:
#                 class_to_idx = json.load(f)
#             self.idx_to_class = {idx: cls for cls, idx in class_to_idx.items()}

#         if model_path.exists():
#             state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
#             self.model.load_state_dict(state_dict)
#             self.model.eval()
#             self.model_loaded = True

#     def _build_model(self):
#         model = models.mobilenet_v2(weights=None)
#         model.classifier[1] = nn.Linear(model.last_channel, 2)
#         model.to(self.device)
#         return model

#     def predict(self, image_path: str) -> dict:
#         if not self.model_loaded:
#             return {
#                 "prediction": None,
#                 "raw_prediction": None,
#                 "confidence": None,
#                 "confidence_percent": None,
#                 "confidence_band": None,
#                 "status": "model_not_loaded"
#             }

#         if self.idx_to_class is None:
#             return {
#                 "prediction": None,
#                 "raw_prediction": None,
#                 "confidence": None,
#                 "confidence_percent": None,
#                 "confidence_band": None,
#                 "status": "class_mapping_not_loaded"
#             }

#         image = load_image(image_path)
#         tensor = self.transform(image).unsqueeze(0).to(self.device)

#         with torch.no_grad():
#             outputs = self.model(tensor)
#             probs = F.softmax(outputs, dim=1)
#             confidence, pred_idx = torch.max(probs, dim=1)

#         pred_idx = pred_idx.item()
#         confidence = float(confidence.item())
#         pred_class = self.idx_to_class[pred_idx]

#         if confidence >= 0.75:
#             confidence_band = "high"
#         elif confidence >= 0.60:
#             confidence_band = "moderate"
#         else:
#             confidence_band = "low"

#         return {
#             "prediction": pred_class,
#             "raw_prediction": pred_class,
#             "confidence": round(confidence, 4),
#             "confidence_percent": round(confidence * 100, 2),
#             "confidence_band": confidence_band,
#             "status": "ok"
#         }


# classifier = JaundiceClassifier(MODEL_PATH)



# """
# JaundiCare — ONNX INT8 Inference Engine
# Replaces PyTorch cv_inference.py after running convert_to_onnx.py.

# Benefits over PyTorch FP32:
# - Model size: ~32MB → ~8MB
# - Inference latency: ~4s → ~2s on CPU
# - No PyTorch dependency at runtime (onnxruntime is much lighter)
# - Identical output format — drop-in replacement, no route changes needed
# """

# import json
# import numpy as np
# from pathlib import Path
# from PIL import Image
# import onnxruntime as ort

# from app.config import WEIGHTS_DIR, CLASS_MAP_PATH

# ONNX_INT8_PATH = WEIGHTS_DIR / "jaundice_mobilenetv2_int8.onnx"
# ONNX_FP32_PATH = WEIGHTS_DIR / "jaundice_mobilenetv2.onnx"

# # ImageNet normalisation — must match training preprocessing exactly
# MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
# STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)


# def preprocess(image_path: str) -> np.ndarray:
#     """Load and preprocess image to match training pipeline."""
#     img = Image.open(image_path).convert("RGB")
#     img = img.resize((224, 224), Image.BILINEAR)
#     arr = np.array(img, dtype=np.float32) / 255.0
#     arr = (arr - MEAN) / STD
#     # HWC → CHW → NCHW
#     arr = arr.transpose(2, 0, 1)[np.newaxis, :]
#     return arr


# class JaundiceClassifier:
#     def __init__(self):
#         self.session     = None
#         self.model_loaded = False
#         self.idx_to_class = None

#         # Load class mapping
#         if CLASS_MAP_PATH.exists():
#             with open(CLASS_MAP_PATH, "r", encoding="utf-8") as f:
#                 class_to_idx = json.load(f)
#             self.idx_to_class = {int(idx): cls for cls, idx in class_to_idx.items()}

#         # Prefer INT8 model, fall back to FP32 if not yet converted
#         model_path = ONNX_INT8_PATH if ONNX_INT8_PATH.exists() else ONNX_FP32_PATH

#         if model_path.exists():
#             sess_options = ort.SessionOptions()
#             sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
#             sess_options.intra_op_num_threads = 2   # keep CPU usage reasonable on Render free tier

#             self.session = ort.InferenceSession(
#                 str(model_path),
#                 sess_options=sess_options,
#                 providers=["CPUExecutionProvider"],
#             )
#             self.model_loaded = True
#             print(f"[JaundiceClassifier] Loaded ONNX model: {model_path.name}")
#         else:
#             print("[JaundiceClassifier] WARNING: No ONNX model found. Run convert_to_onnx.py first.")

#     def _softmax(self, logits: np.ndarray) -> np.ndarray:
#         e = np.exp(logits - np.max(logits))
#         return e / e.sum()

#     def predict(self, image_path: str) -> dict:
#         if not self.model_loaded:
#             return {
#                 "prediction": None,
#                 "raw_prediction": None,
#                 "confidence": None,
#                 "confidence_percent": None,
#                 "confidence_band": None,
#                 "status": "model_not_loaded",
#             }

#         if self.idx_to_class is None:
#             return {
#                 "prediction": None,
#                 "raw_prediction": None,
#                 "confidence": None,
#                 "confidence_percent": None,
#                 "confidence_band": None,
#                 "status": "class_mapping_not_loaded",
#             }

#         try:
#             input_tensor = preprocess(image_path)
#             input_name   = self.session.get_inputs()[0].name
#             logits       = self.session.run(None, {input_name: input_tensor})[0][0]
#             probs        = self._softmax(logits)
#             pred_idx     = int(np.argmax(probs))
#             confidence   = float(probs[pred_idx])
#             pred_class   = self.idx_to_class.get(pred_idx, "unknown")

#             if confidence >= 0.75:
#                 confidence_band = "high"
#             elif confidence >= 0.60:
#                 confidence_band = "moderate"
#             else:
#                 confidence_band = "low"

#             return {
#                 "prediction":        pred_class,
#                 "raw_prediction":    pred_class,
#                 "confidence":        round(confidence, 4),
#                 "confidence_percent":round(confidence * 100, 2),
#                 "confidence_band":   confidence_band,
#                 "status":            "ok",
#             }

#         except Exception as e:
#             print(f"[JaundiceClassifier] Inference error: {e}")
#             return {
#                 "prediction": None,
#                 "raw_prediction": None,
#                 "confidence": None,
#                 "confidence_percent": None,
#                 "confidence_band": None,
#                 "status": f"inference_error: {str(e)}",
#             }


# # Singleton — loaded once at startup, reused for every request
# classifier = JaundiceClassifier()



"""
JaundiCare — ONNX INT8 Inference Engine
Replaces PyTorch cv_inference.py after running convert_to_onnx.py.

Benefits over PyTorch FP32:
- Model size: ~32MB → ~8MB
- Inference latency: ~4s → ~2s on CPU
- No PyTorch dependency at runtime (onnxruntime is much lighter)
- Identical output format — drop-in replacement, no route changes needed
"""

import json
import numpy as np
from pathlib import Path
from PIL import Image
import onnxruntime as ort

from app.config import WEIGHTS_DIR, CLASS_MAP_PATH

ONNX_INT8_PATH = WEIGHTS_DIR / "jaundice_mobilenetv2_int8.onnx"
ONNX_FP32_PATH = WEIGHTS_DIR / "jaundice_mobilenetv2.onnx"

# ImageNet normalisation — must match training preprocessing exactly
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def preprocess(image_path: str) -> np.ndarray:
    """Load and preprocess image to match training pipeline."""
    img = Image.open(image_path).convert("RGB")
    img = img.resize((224, 224), Image.BILINEAR)
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = (arr - MEAN) / STD
    # HWC → CHW → NCHW
    arr = arr.transpose(2, 0, 1)[np.newaxis, :]
    return arr


class JaundiceClassifier:
    def __init__(self):
        self.session      = None
        self.model_loaded = False
        self.idx_to_class = None

        # Load class mapping
        if CLASS_MAP_PATH.exists():
            with open(CLASS_MAP_PATH, "r", encoding="utf-8") as f:
                class_to_idx = json.load(f)
            self.idx_to_class = {int(idx): cls for cls, idx in class_to_idx.items()}

        # Prefer INT8 model, fall back to FP32 if not yet converted
        model_path = ONNX_INT8_PATH if ONNX_INT8_PATH.exists() else ONNX_FP32_PATH

        if model_path.exists():
            sess_options = ort.SessionOptions()
            sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            sess_options.intra_op_num_threads = 2   # keep CPU usage reasonable on Render free tier

            self.session = ort.InferenceSession(
                str(model_path),
                sess_options=sess_options,
                providers=["CPUExecutionProvider"],
            )
            self.model_loaded = True
            print(f"[JaundiceClassifier] Loaded ONNX model: {model_path.name}")
        else:
            print("[JaundiceClassifier] WARNING: No ONNX model found. Run convert_to_onnx.py first.")

    def predict(self, image_path: str) -> dict:
        if not self.model_loaded:
            return {
                "prediction": None,
                "raw_prediction": None,
                "confidence": None,
                "confidence_percent": None,
                "confidence_band": None,
                "status": "model_not_loaded",
            }

        if self.idx_to_class is None:
            return {
                "prediction": None,
                "raw_prediction": None,
                "confidence": None,
                "confidence_percent": None,
                "confidence_band": None,
                "status": "class_mapping_not_loaded",
            }

        try:
            input_tensor = preprocess(image_path)
            input_name   = self.session.get_inputs()[0].name
            
            # The model now safely outputs probabilities directly thanks to the wrapper class
            probs        = self.session.run(None, {input_name: input_tensor})[0][0]
            
            pred_idx     = int(np.argmax(probs))
            confidence   = float(probs[pred_idx])
            pred_class   = self.idx_to_class.get(pred_idx, "unknown")

            if confidence >= 0.75:
                confidence_band = "high"
            elif confidence >= 0.60:
                confidence_band = "moderate"
            else:
                confidence_band = "low"

            return {
                "prediction":        pred_class,
                "raw_prediction":    pred_class,
                "confidence":        round(confidence, 4),
                "confidence_percent":round(confidence * 100, 2),
                "confidence_band":   confidence_band,
                "status":            "ok",
            }

        except Exception as e:
            print(f"[JaundiceClassifier] Inference error: {e}")
            return {
                "prediction": None,
                "raw_prediction": None,
                "confidence": None,
                "confidence_percent": None,
                "confidence_band": None,
                "status": f"inference_error: {str(e)}",
            }


# Singleton — loaded once at startup, reused for every request
classifier = JaundiceClassifier()