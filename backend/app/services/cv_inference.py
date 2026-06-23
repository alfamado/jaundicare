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


from pathlib import Path
import json
import torch
import torch.nn.functional as F
from torchvision import models
from torch import nn

from app.config import MODEL_PATH, CLASS_MAP_PATH
from app.services.preprocessing import build_inference_transform, load_image


class JaundiceClassifier:
    def __init__(self, model_path: Path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self._build_model()
        self.transform = build_inference_transform()
        self.model_loaded = False
        self.idx_to_class = None

        if CLASS_MAP_PATH.exists():
            with open(CLASS_MAP_PATH, "r", encoding="utf-8") as f:
                class_to_idx = json.load(f)
            self.idx_to_class = {idx: cls for cls, idx in class_to_idx.items()}

        if model_path.exists():
            state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
            self.model.load_state_dict(state_dict)
            self.model.eval()
            self.model_loaded = True

    def _build_model(self):
        model = models.mobilenet_v2(weights=None)
        model.classifier[1] = nn.Linear(model.last_channel, 2)
        model.to(self.device)
        return model

    def predict(self, image_path: str) -> dict:
        if not self.model_loaded:
            return {
                "prediction": None,
                "raw_prediction": None,
                "confidence": None,
                "confidence_percent": None,
                "confidence_band": None,
                "status": "model_not_loaded"
            }

        if self.idx_to_class is None:
            return {
                "prediction": None,
                "raw_prediction": None,
                "confidence": None,
                "confidence_percent": None,
                "confidence_band": None,
                "status": "class_mapping_not_loaded"
            }

        image = load_image(image_path)
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probs = F.softmax(outputs, dim=1)
            confidence, pred_idx = torch.max(probs, dim=1)

        pred_idx = pred_idx.item()
        confidence = float(confidence.item())
        pred_class = self.idx_to_class[pred_idx]

        if confidence >= 0.75:
            confidence_band = "high"
        elif confidence >= 0.60:
            confidence_band = "moderate"
        else:
            confidence_band = "low"

        return {
            "prediction": pred_class,
            "raw_prediction": pred_class,
            "confidence": round(confidence, 4),
            "confidence_percent": round(confidence * 100, 2),
            "confidence_band": confidence_band,
            "status": "ok"
        }


classifier = JaundiceClassifier(MODEL_PATH)