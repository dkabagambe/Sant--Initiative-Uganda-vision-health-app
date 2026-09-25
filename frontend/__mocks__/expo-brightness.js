// Mock expo-brightness
module.exports = {
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  setBrightnessAsync:      jest.fn().mockResolvedValue(undefined),
  getBrightnessAsync:      jest.fn().mockResolvedValue(1.0),
};
