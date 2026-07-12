// Learn more https://docs.expo.io/guides/customizing-metro
// const { getDefaultConfig } = require('expo/metro-config');

// /** @type {import('expo/metro-config').MetroConfig} */
// const config = getDefaultConfig(__dirname);

// module.exports = config;



const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Intercept the standard asset list and append 'onnx' explicitly
config.resolver.assetExts.push("onnx");

module.exports = config;