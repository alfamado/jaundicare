"""
JaundiCare — Performance & Accuracy Benchmark
Compares the baseline FP32 ONNX model against the optimized INT8 version.
"""

import time
import numpy as np
# from pathlib import Path
from PIL import Image, ImageDraw
import onnxruntime as ort

# Reuse the preprocessing pipeline from your inference engine
# from cv_inference import preprocess, classifier

# BASE_DIR    = Path(__file__).resolve().parent
# WEIGHTS_DIR = BASE_DIR / "weights"

# Replace them with this to match your folder nesting:
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Force Python to see the root 'backend' or 'backend/app/services' directory
SERVICES_DIR = BASE_DIR / "app" / "services"
if str(SERVICES_DIR) not in sys.path:
    sys.path.append(str(SERVICES_DIR))

# Now you can import it seamlessly
from cv_inference import preprocess, classifier

# Map weights directory relative to the correct app workspace
WEIGHTS_DIR = BASE_DIR / "weights"

FP32_PATH   = WEIGHTS_DIR / "jaundice_mobilenetv2.onnx"
INT8_PATH   = WEIGHTS_DIR / "jaundice_mobilenetv2_int8.onnx"

# def create_dummy_image(path: str):
#     """Creates a temporary image if you don't have one handy in your terminal."""
#     img = Image.new("RGB", (300, 300), color=(255, 223, 128)) # Slightly yellow dummy tint
#     d = ImageDraw.Draw(img)
#     d.text((20, 140), "Test Sample", fill=(0, 0, 0))
#     img.save(path)
#     print(f" Created temporary test image at: {path}")

def run_benchmark_on_session(session, input_tensor, input_name, iterations=50):
    """Runs a warm-up phase and profiles execution latency over multiple iterations."""
    # Warm-up (jits the engine compilation structures)
    for _ in range(5):
        _ = session.run(None, {input_name: input_tensor})[0][0]
        
    # Latency profiling loop
    start_time = time.perf_counter()
    for _ in range(iterations):
        outputs = session.run(None, {input_name: input_tensor})[0][0]
    end_time = time.perf_counter()
    
    avg_latency = ((end_time - start_time) / iterations) * 1000  # Convert to milliseconds
    return outputs, avg_latency

def main():
    # test_img_path = str(BASE_DIR / "benchmark_sample.jpg")
    test_img_path = r"C:\Users\Abdulmalik\Desktop\babies\jaundice\test 1.jpg"
    # if not Path(test_img_path).exists():
    #     create_dummy_image(test_img_path)

    # 1. Prepare shared input tensor data
    input_tensor = preprocess(test_img_path)
    
    # 2. Configure runtime parameters (Matching your production settings)
    opts = ort.SessionOptions()
    opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    opts.intra_op_num_threads = 2
    
    print("\n--- Starting Model Assessment Engine ---")
    
    # Profile FP32 Core Baseline
    if FP32_PATH.exists():
        sess_fp32 = ort.InferenceSession(str(FP32_PATH), sess_options=opts, providers=["CPUExecutionProvider"])
        input_name = sess_fp32.get_inputs()[0].name
        raw_probs_fp32, latency_fp32 = run_benchmark_on_session(sess_fp32, input_tensor, input_name)
        print(f"FP32 Model Baseline -> Avg Speed: {latency_fp32:.2f} ms per image")
    else:
        print("Missing baseline FP32 model file.")
        return

    # Profile Optimized INT8 Core
    if INT8_PATH.exists():
        sess_int8 = ort.InferenceSession(str(INT8_PATH), sess_options=opts, providers=["CPUExecutionProvider"])
        input_name = sess_int8.get_inputs()[0].name
        raw_probs_int8, latency_int8 = run_benchmark_on_session(sess_int8, input_tensor, input_name)
        print(f"INT8 Model Optimized -> Avg Speed: {latency_int8:.2f} ms per image")
    else:
        print("Missing optimized INT8 model file.")
        return

    # 3. Output Discrepancy & Speed Diagnostics
    speedup = latency_fp32 / latency_int8
    print("\n================ SYSTEM METRICS ================")
    # print(f" Speed Improvement:  {speedup:.2x} faster on CPU")
    # To this (using 'f' for float):
    print(f" Speed Improvement:  {speedup:.2f}x faster on CPU")
    print(f" Raw FP32 Outputs:   {raw_probs_fp32.tolist()}")
    print(f" Raw INT8 Outputs:   {raw_probs_int8.tolist()}")
    
    # Calculate variance to ensure the warning didn't corrupt class integrity
    variance = np.abs(raw_probs_fp32 - raw_probs_int8)
    print(f" Max Output Variance: {np.max(variance):.5f}")
    
    if np.max(variance) < 0.05:
        print(" Verdict:             PASSED! The accuracy drop is safely negligible.")
    else:
        print(" Verdict:             ATTENTION — Discrepancies exist. Verify your production edge thresholds.")
    print("================================================\n")
    
    # Clean up dummy image asset cleanly
    if Path(test_img_path).exists():
        Path(test_img_path).unlink()

if __name__ == "__main__":
    main()