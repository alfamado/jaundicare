"""
JaundiCare — PyTorch to ONNX INT8 Conversion Script
Run this ONCE on your laptop from the backend/ folder:
  python convert_to_onnx.py

Output: backend/weights/jaundice_mobilenetv2_int8.onnx (~8MB)

Requirements (install in your venv first):
  pip install onnx onnxruntime onnxruntime-extensions
"""

import json
import torch
import torch.nn as nn
from torchvision import models
from pathlib import Path
import onnx
from onnxruntime.quantization import quantize_dynamic, QuantType

# ── Paths ────────────────────────────────────────────────────────
BASE_DIR       = Path(__file__).resolve().parent
WEIGHTS_DIR    = BASE_DIR / "weights"
MODEL_PATH     = WEIGHTS_DIR / "jaundice_mobilenetv2.pth"
ONNX_PATH      = WEIGHTS_DIR / "jaundice_mobilenetv2.onnx"
ONNX_INT8_PATH = WEIGHTS_DIR / "jaundice_mobilenetv2_int8.onnx"
CLASS_MAP_PATH = WEIGHTS_DIR / "class_to_idx.json"

# Wrapper class to normalize unnormalized network outputs safely for downstream consumption
class InferenceWrapper(nn.Module):
    def __init__(self, base_model):
        super().__init__()
        self.base_model = base_model
        # Dim 1 targets the class category index channel explicitly
        self.softmax = nn.Softmax(dim=1)

    def forward(self, x):
        logits = self.base_model(x)
        return self.softmax(logits)

def build_model():
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.last_channel, 2)
    return model

def main():
    print("Step 1 — Loading PyTorch model...")
    device = torch.device("cpu")  # Export on CPU always
    model  = build_model()
    state  = torch.load(MODEL_PATH, map_location=device, weights_only=True)
    model.load_state_dict(state)
    
    # Wrap the core model to inject an inline Softmax operational node for ONNX
    export_ready_model = InferenceWrapper(model)
    export_ready_model.eval()
    print(f"  Model loaded and wrapped from {MODEL_PATH}")

    print("Step 2 — Exporting to ONNX FP32...")
    dummy_input = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        export_ready_model,
        dummy_input,
        str(ONNX_PATH), # Cast PathObjects cleanly to strings for older engine parity
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=["image"],
        output_names=["probabilities"], # Renamed from logits to match true softmax output data representation
        dynamic_axes={"image": {0: "batch_size"}, "probabilities": {0: "batch_size"}},
    )
    print(f"  ONNX FP32 saved: {ONNX_PATH} ({ONNX_PATH.stat().st_size / 1e6:.1f} MB)")

    print("Step 3 — Validating ONNX model...")
    onnx_model = onnx.load(str(ONNX_PATH))
    onnx.checker.check_model(onnx_model)
    print("  ONNX model is valid")

    print("Step 4 — Quantizing to INT8...")
    quantize_dynamic(
        model_input=str(ONNX_PATH),
        model_output=str(ONNX_INT8_PATH),
        weight_type=QuantType.QInt8,
    )
    print(f"  ONNX INT8 saved: {ONNX_INT8_PATH} ({ONNX_INT8_PATH.stat().st_size / 1e6:.1f} MB)")

    print("\nConversion complete!")
    print(f"  FP32: {ONNX_PATH.stat().st_size / 1e6:.1f} MB")
    print(f"  INT8: {ONNX_INT8_PATH.stat().st_size / 1e6:.1f} MB")
    print(f"  Compression: {ONNX_PATH.stat().st_size / ONNX_INT8_PATH.stat().st_size:.1f}x smaller")

if __name__ == "__main__":
    main()

# import json
# import torch
# import torch.nn as nn
# from torchvision import models
# from pathlib import Path
# import onnx
# from onnxruntime.quantization import quantize_dynamic, QuantType

# # ── Paths ────────────────────────────────────────────────────────
# BASE_DIR       = Path(__file__).resolve().parent
# WEIGHTS_DIR    = BASE_DIR / "weights"
# MODEL_PATH     = WEIGHTS_DIR / "jaundice_mobilenetv2.pth"
# ONNX_PATH      = WEIGHTS_DIR / "jaundice_mobilenetv2.onnx"
# ONNX_INT8_PATH = WEIGHTS_DIR / "jaundice_mobilenetv2_int8.onnx"
# CLASS_MAP_PATH = WEIGHTS_DIR / "class_to_idx.json"

# def build_model():
#     model = models.mobilenet_v2(weights=None)
#     model.classifier[1] = nn.Linear(model.last_channel, 2)
#     return model

# def main():
#     print("Step 1 — Loading PyTorch model...")
#     device = torch.device("cpu")  # export on CPU always
#     model  = build_model()
#     state  = torch.load(MODEL_PATH, map_location=device, weights_only=True)
#     model.load_state_dict(state)
#     model.eval()
#     print(f"  Model loaded from {MODEL_PATH}")

#     print("Step 2 — Exporting to ONNX FP32...")
#     dummy_input = torch.randn(1, 3, 224, 224)
#     torch.onnx.export(
#         model,
#         dummy_input,
#         ONNX_PATH,
#         export_params=True,
#         opset_version=17,
#         do_constant_folding=True,
#         input_names=["image"],
#         output_names=["logits"],
#         dynamic_axes={"image": {0: "batch_size"}, "logits": {0: "batch_size"}},
#     )
#     print(f"  ONNX FP32 saved: {ONNX_PATH} ({ONNX_PATH.stat().st_size / 1e6:.1f} MB)")

#     print("Step 3 — Validating ONNX model...")
#     onnx_model = onnx.load(ONNX_PATH)
#     onnx.checker.check_model(onnx_model)
#     print("  ONNX model is valid")

#     print("Step 4 — Quantizing to INT8...")
#     quantize_dynamic(
#         model_input=ONNX_PATH,
#         model_output=ONNX_INT8_PATH,
#         weight_type=QuantType.QInt8,
#     )
#     print(f"  ONNX INT8 saved: {ONNX_INT8_PATH} ({ONNX_INT8_PATH.stat().st_size / 1e6:.1f} MB)")

#     print("\nConversion complete!")
#     print(f"  FP32: {ONNX_PATH.stat().st_size / 1e6:.1f} MB")
#     print(f"  INT8: {ONNX_INT8_PATH.stat().st_size / 1e6:.1f} MB")
#     print(f"  Compression: {ONNX_PATH.stat().st_size / ONNX_INT8_PATH.stat().st_size:.1f}x smaller")

# if __name__ == "__main__":
#     main()
