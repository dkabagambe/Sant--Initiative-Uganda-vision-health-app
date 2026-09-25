// Mock expo-av
const Sound = {
  createAsync: jest.fn().mockResolvedValue({
    sound: {
      playAsync:       jest.fn().mockResolvedValue(undefined),
      setPositionAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync:     jest.fn().mockResolvedValue(undefined),
    },
  }),
};

const Audio = {
  Sound,
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
};

module.exports = { Audio };
