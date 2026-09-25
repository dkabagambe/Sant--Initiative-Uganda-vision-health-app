/** @type {import('jest').Config} */
module.exports = {
  // Bypass jest-expo / react-native preset - use a plain node environment
  // for pure logic tests. UI render tests (React Testing Library) need a
  // dedicated jsdom or RN environment setup that requires @react-native/jest-preset.
  testEnvironment: "node",

  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      { configFile: "./babel.config.js" },
    ],
  },

  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx",
  ],

  transformIgnorePatterns: [
    // Transform expo & react-native packages (they ship ESM/JSX that node can't run raw)
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)" +
      "|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*" +
      "|react-navigation|@react-navigation/.*" +
      "|@unimodules/.*|unimodules|sentry-expo|native-base" +
      "|react-native-svg|react-native-gesture-handler" +
      "|react-native-screens|react-native-safe-area-context" +
      "|lucide-react-native)",
  ],

  moduleNameMapper: {
    // Static assets
    "\\.(png|jpg|jpeg|gif|webp|mp3|wav|mp4|ttf|otf)$": "<rootDir>/__mocks__/fileMock.js",
    // Native module mocks
    "^expo-av$":         "<rootDir>/__mocks__/expo-av.js",
    "^expo-brightness$": "<rootDir>/__mocks__/expo-brightness.js",
    "^expo-haptics$":    "<rootDir>/__mocks__/expo-haptics.js",
    "^expo-speech$":     "<rootDir>/__mocks__/expo-speech.js",
    // Navigation mocks
    "^@react-navigation/native$":        "<rootDir>/__mocks__/@react-navigation/native.js",
    "^@react-navigation/native-stack$":  "<rootDir>/__mocks__/@react-navigation/native.js",
    // Suppress other native modules that can't run in node
    "^react-native-gesture-handler$":    "<rootDir>/__mocks__/fileMock.js",
    "^react-native-safe-area-context$":  "<rootDir>/__mocks__/fileMock.js",
    "^react-native-screens$":            "<rootDir>/__mocks__/fileMock.js",
  },

  setupFilesAfterFramework: [],
  forceExit: true,
};
