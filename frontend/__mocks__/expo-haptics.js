// Mock expo-haptics
module.exports = {
  notificationAsync:         jest.fn().mockResolvedValue(undefined),
  impactAsync:               jest.fn().mockResolvedValue(undefined),
  selectionAsync:            jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error:   "error",
  },
  ImpactFeedbackStyle: {
    Light:  "light",
    Medium: "medium",
    Heavy:  "heavy",
  },
};
