// Mock expo-audio (replaces expo-av)
const mockPlayer = {
  play:   jest.fn(),
  seekTo: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn(),
};

const createAudioPlayer = jest.fn().mockReturnValue(mockPlayer);

module.exports = { createAudioPlayer };
