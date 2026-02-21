import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Responsive scaling with limits
export const scale = (size: number) => {
  const scaledSize = (SCREEN_WIDTH / BASE_WIDTH) * size;
  // Limit scaling for very large screens
  return Math.min(scaledSize, size * 1.5);
};

export const verticalScale = (size: number) => {
  const scaledSize = (SCREEN_HEIGHT / BASE_HEIGHT) * size;
  // Limit scaling for very tall screens
  return Math.min(scaledSize, size * 1.5);
};

export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Safe area padding (deprecated - use SafeAreaView instead)
export const getStatusBarHeight = () => {
  return Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
};

export const getSafeAreaPadding = () => ({
  paddingTop: getStatusBarHeight(),
  paddingBottom: Platform.OS === 'ios' ? 34 : 0,
});

// Responsive font sizes with min/max limits
export const fontSize = {
  tiny: Math.max(10, Math.min(moderateScale(10), 12)),
  small: Math.max(12, Math.min(moderateScale(12), 14)),
  regular: Math.max(14, Math.min(moderateScale(14), 16)),
  medium: Math.max(16, Math.min(moderateScale(16), 18)),
  large: Math.max(18, Math.min(moderateScale(18), 22)),
  xlarge: Math.max(20, Math.min(moderateScale(20), 24)),
  xxlarge: Math.max(24, Math.min(moderateScale(24), 28)),
  huge: Math.max(28, Math.min(moderateScale(32), 36)),
};

// Spacing with limits
export const spacing = {
  xs: Math.max(4, Math.min(scale(4), 6)),
  sm: Math.max(8, Math.min(scale(8), 12)),
  md: Math.max(12, Math.min(scale(12), 16)),
  lg: Math.max(16, Math.min(scale(16), 20)),
  xl: Math.max(20, Math.min(scale(20), 24)),
  xxl: Math.max(24, Math.min(scale(24), 32)),
  xxxl: Math.max(32, Math.min(scale(32), 40)),
};

// Device size categories
export const isSmallDevice = SCREEN_WIDTH < 360;
export const isMediumDevice = SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 400;
export const isLargeDevice = SCREEN_WIDTH >= 400 && SCREEN_WIDTH < 480;
export const isExtraLargeDevice = SCREEN_WIDTH >= 480;

// Screen height categories
export const isShortScreen = SCREEN_HEIGHT < 700;
export const isTallScreen = SCREEN_HEIGHT >= 900;

// Responsive helper
export const responsive = {
  width: (percentage: number) => (SCREEN_WIDTH * percentage) / 100,
  height: (percentage: number) => (SCREEN_HEIGHT * percentage) / 100,
};
