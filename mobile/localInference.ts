// import { Asset } from "expo-asset";
// import * as ort from "onnxruntime-react-native";

// /**
//  * Runs a 100% offline Jaundice prediction using the on-device compiled INT8 model.
//  * @param preprocessedFloat32Array A flat Float32Array containing exactly 150528 normalized pixels (1 * 3 * 224 * 224)
//  * @returns A promise resolving to an array of probabilities: [prob_healthy, prob_jaundice] or null on error
//  */
// export async function runLocalInference(preprocessedFloat32Array: Float32Array): Promise<number[] | null> {
//   try {
//     // 1. Point directly to the model asset using its precise relative path from the root
//     const modelAsset = Asset.fromModule(
//       require("./assets/models/jaundice_mobilenetv2_int8.onnx")
//     );

//     // 2. Ensure the asset is cached on the device filesystem
//     if (!modelAsset.localUri) {
//       console.log("[LocalML] Extracting model from application bundle to device disk...");
//       await modelAsset.downloadAsync();
//     }

//     const nativeModelPath = modelAsset.localUri;
//     if (!nativeModelPath) {
//       throw new Error("Failed to resolve native localUri for the ONNX model asset.");
//     }

//     console.log(`[LocalML] Native model loaded at target path: ${nativeModelPath}`);

//     // 3. Initialize the on-device ONNX Runtime session
//     const session = await ort.InferenceSession.create(nativeModelPath);

//     // 4. Match the exact input dimensions expected by MobileNetV2: [Batch, Channels, Height, Width] -> [1, 3, 224, 224]
//     const inputShape = [1, 3, 224, 224];
//     const inputTensor = new ort.Tensor("float32", preprocessedFloat32Array, inputShape);

//     // 5. Build execution feed mapping dynamically using the internal model metadata
//     const inputKey = session.inputNames[0]; // Resolves cleanly to "image" as configured in your python script
//     const feeds = { [inputKey]: inputTensor };

//     // 6. Execute calculation thread synchronously on the device CPU/Accelerators
//     console.log("[LocalML] Executing forward matrix calculation pass...");
//     const outputs = await session.run(feeds);

//     // 7. Extract probabilities tensor using the output key configuration metadata
//     const outputKey = session.outputNames[0]; // Resolves cleanly to "probabilities"
//     const outputTensor = outputs[outputKey];

//     // Read the values as flat raw numeric outputs
//     const rawData = outputTensor.data as Float32Array;
    
//     // Convert to standard JavaScript array before returning: [prob_class_0, prob_class_1]
//     const predictionProbabilities = Array.from(rawData);
    
//     console.log("[LocalML] Matrix inference complete. Raw Vector:", predictionProbabilities);
//     return predictionProbabilities;

//   } catch (error) {
//     console.error("[LocalML] High-level engine inference failure:", error);
//     return null;
//   }
// }




// import { Asset } from "expo-asset";
// import * as ort from "onnxruntime-react-native";
// import { GLView } from "expo-gl";

// /**
//  * Decodes an image URI into a normalized flat Float32Array [1, 3, 224, 224] using WebGL hardware context.
//  */
// async function preprocessImageUriToTensor(uri: string): Promise<Float32Array> {
//   return new Promise((resolve, reject) => {
//     const glContext = GLView.createContextAsync();
//     glContext.then(async (gl) => {
//       try {
//         // 1. Create native texture from image URI
//         const texture = gl.createTexture();
//         gl.bindTexture(gl.TEXTURE_2D, texture);
        
//         // Load image asset into GL memory
//         const image = { uri, width: 224, height: 224 };
//         // Use standard WebGL texture allocation methods via expo-gl extension
//         // @ts-ignore
//         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 224, 224, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

//         // 2. Create a Framebuffer to read back pixels from texture
//         const framebuffer = gl.createFramebuffer();
//         gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
//         gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

//         // 3. Read raw byte pixels out of the WebGL buffer
//         const pixels = new Uint8Array(224 * 224 * 4);
//         gl.readPixels(0, 0, 224, 224, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

//         // 4. Preprocess to PyTorch / MobileNetV2 standards: NCHW format & Normalized
//         // Means: R=0.485, G=0.456, B=0.406 | Stds: R=0.229, G=0.224, B=0.225
//         const floatBuffer = new Float32Array(1 * 3 * 224 * 224);
//         const totalPixels = 224 * 224;

//         for (let i = 0; i < totalPixels; i++) {
//           const r = pixels[i * 4] / 255.0;
//           const g = pixels[i * 4 + 1] / 255.0;
//           const b = pixels[i * 4 + 2] / 255.0;

//           // Split interleaved RGBA array cleanly into contiguous NCHW channels
//           floatBuffer[i]                   = (r - 0.485) / 0.229; // Red Channel
//           floatBuffer[totalPixels + i] = (g - 0.456) / 0.224; // Green Channel
//           floatBuffer[totalPixels * 2 + i] = (b - 0.406) / 0.225; // Blue Channel
//         }

//         // Clean up GL native state
//         gl.deleteFramebuffer(framebuffer);
//         gl.deleteTexture(texture);
        
//         resolve(floatBuffer);
//       } catch (err) {
//         reject(err);
//       }
//     });
//   });
// }

// /**
//  * Runs a 100% offline Jaundice prediction directly from a local mobile file path URI.
//  * @param imageUri Local filesystem or asset string path pointing to a selected photo.
//  * @returns A promise resolving to an array of probabilities: [prob_healthy, prob_jaundice] or null on error.
//  */
// export async function runLocalInferenceWithUri(imageUri: string): Promise<number[] | null> {
//   try {
//     // 1. Process raw pixels into a standardized network tensor matrix
//     console.log("[LocalML] Extracting and normalizing pixel matrices via WebGL hardware...");
//     const preprocessedFloat32Array = await preprocessImageUriToTensor(imageUri);

//     // 2. Point directly to the model asset using its precise relative path from the root
//     const modelAsset = Asset.fromModule(
//       require("./assets/models/jaundice_mobilenetv2_int8.onnx")
//     );

//     // 3. Ensure the asset is cached on the device filesystem
//     if (!modelAsset.localUri) {
//       console.log("[LocalML] Extracting model from application bundle to device disk...");
//       await modelAsset.downloadAsync();
//     }

//     const nativeModelPath = modelAsset.localUri;
//     if (!nativeModelPath) {
//       throw new Error("Failed to resolve native localUri for the ONNX model asset.");
//     }

//     // 4. Initialize the on-device ONNX Runtime session
//     const session = await ort.InferenceSession.create(nativeModelPath);

//     // 5. Match the exact input dimensions expected by MobileNetV2: [1, 3, 224, 224]
//     const inputShape = [1, 3, 224, 224];
//     const inputTensor = new ort.Tensor("float32", preprocessedFloat32Array, inputShape);

//     const inputKey = session.inputNames[0]; 
//     const feeds = { [inputKey]: inputTensor };

//     // 6. Execute calculation thread synchronously on the device hardware
//     console.log("[LocalML] Executing forward matrix calculation pass...");
//     const outputs = await session.run(feeds);

//     const outputKey = session.outputNames[0]; 
//     const outputTensor = outputs[outputKey];

//     const rawData = outputTensor.data as Float32Array;
//     const predictionProbabilities = Array.from(rawData);
    
//     console.log("[LocalML] Matrix inference complete. Raw Vector:", predictionProbabilities);
//     return predictionProbabilities;

//   } catch (error) {
//     console.error("[LocalML] High-level engine inference failure:", error);
//     return null;
//   }
// }

import { Asset } from "expo-asset";
import * as ort from "onnxruntime-react-native";
import { GLView } from "expo-gl";

/**
 * Keep this in sync with backend/weights/class_to_idx.json.
 * The server and the mobile model are exported from the same .pth checkpoint.
 */
export const LOCAL_MODEL_CLASS_INDEX = {
  jaundice: 0,
  normal: 1,
} as const;

function normaliseModelOutput(values: number[]): number[] | null {
  if (
    values.length !== 2 ||
    values.some((value) => !Number.isFinite(value))
  ) {
    return null;
  }

  // convert_to_onnx.py exports a Softmax node and names this output
  // "probabilities". Do not apply Softmax a second time: doing so flattens the
  // model confidence and changes clinical escalation behaviour.
  const total = values[0] + values[1];
  if (
    values.every((value) => value >= 0 && value <= 1) &&
    Math.abs(total - 1) <= 0.001
  ) {
    return values;
  }

  // This supports an older, logits-only model during a controlled rollout.
  const maximum = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - maximum));
  const exponentialsTotal = exponentials[0] + exponentials[1];
  return exponentialsTotal > 0
    ? exponentials.map((value) => value / exponentialsTotal)
    : null;
}

/**
 * Decodes an image URI into a normalized flat Float32Array [1, 3, 224, 224] using WebGL hardware context.
 */
async function preprocessImageUriToTensor(uri: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const glContext = GLView.createContextAsync();
    glContext.then(async (gl) => {
      try {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Fix 1: Correct WebGL's default inverted coordinate space back to Top-Left standard
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        const image = { uri, width: 224, height: 224 };
        // @ts-ignore
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 224, 224, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        const pixels = new Uint8Array(224 * 224 * 4);
        gl.readPixels(0, 0, 224, 224, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        const floatBuffer = new Float32Array(1 * 3 * 224 * 224);
        const totalPixels = 224 * 224;

        for (let i = 0; i < totalPixels; i++) {
          const r = pixels[i * 4] / 255.0;
          const g = pixels[i * 4 + 1] / 255.0;
          const b = pixels[i * 4 + 2] / 255.0;

          floatBuffer[i]                   = (r - 0.485) / 0.229; // Red Channel
          floatBuffer[totalPixels + i]     = (g - 0.456) / 0.224; // Green Channel
          floatBuffer[totalPixels * 2 + i] = (b - 0.406) / 0.225; // Blue Channel
        }

        gl.deleteFramebuffer(framebuffer);
        gl.deleteTexture(texture);
        
        resolve(floatBuffer);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Runs a 100% offline Jaundice prediction directly from a local mobile file path URI.
 * @param imageUri Local filesystem or asset string path pointing to a selected photo.
 * @returns A promise resolving to an array of probabilities: [prob_healthy, prob_jaundice] or null on error.
 */
export async function runLocalInferenceWithUri(imageUri: string): Promise<number[] | null> {
  try {
    console.log("[LocalML] Extracting and normalizing pixel matrices via WebGL hardware...");
    const preprocessedFloat32Array = await preprocessImageUriToTensor(imageUri);

    const modelAsset = Asset.fromModule(
      require("./assets/models/jaundice_mobilenetv2_int8.onnx")
    );

    if (!modelAsset.localUri) {
      console.log("[LocalML] Extracting model from application bundle to device disk...");
      await modelAsset.downloadAsync();
    }

    const nativeModelPath = modelAsset.localUri;
    if (!nativeModelPath) {
      throw new Error("Failed to resolve native localUri for the ONNX model asset.");
    }

    const session = await ort.InferenceSession.create(nativeModelPath);

    const inputShape = [1, 3, 224, 224];
    const inputTensor = new ort.Tensor("float32", preprocessedFloat32Array, inputShape);

    const inputKey = session.inputNames[0]; 
    const feeds = { [inputKey]: inputTensor };

    console.log("[LocalML] Executing forward matrix calculation pass...");
    const outputs = await session.run(feeds);

    const outputKey = session.outputNames[0]; 
    const outputTensor = outputs[outputKey];

    const rawOutput = Array.from(outputTensor.data as Float32Array);
    const predictionProbabilities = normaliseModelOutput(rawOutput);
    if (!predictionProbabilities) {
      throw new Error("The local model returned an invalid prediction vector.");
    }
    
    console.log("[LocalML] Matrix inference complete. Probability Vector:", predictionProbabilities);
    return predictionProbabilities;

  } catch (error) {
    console.error("[LocalML] High-level engine inference failure:", error);
    return null;
  }
}
