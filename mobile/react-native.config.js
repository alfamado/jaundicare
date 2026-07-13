/**
 * ONNX Runtime declares an Expo module manifest as well as a legacy React
 * Native package. Expo SDK 56 therefore treats it only as an Expo module and
 * does not add OnnxruntimePackage to Android's generated PackageList.
 *
 * This project-level override keeps the native bridge registered after every
 * `expo prebuild --clean`, which is required before JavaScript can call
 * `onnxruntime-react-native`.
 */
module.exports = {
  dependencies: {
    "onnxruntime-react-native": {
      platforms: {
        android: {
          sourceDir: "android",
          packageImportPath:
            "import ai.onnxruntime.reactnative.OnnxruntimePackage;",
          packageInstance: "new OnnxruntimePackage()",
        },
      },
    },
  },
};
