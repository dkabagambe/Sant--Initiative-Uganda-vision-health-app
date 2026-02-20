import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Responsive scaling
export const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Safe area padding
export const getStatusBarHeight = () => {
  return Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
};

export const getSafeAreaPadding = () => ({
  paddingTop: getStatusBarHeight(),
  paddingBottom: Platform.OS === 'ios' ? 34 : 0,
});

// Responsive font sizes
export const fontSize = {
  tiny: moderateScale(10),
  small: moderateScale(12),
  regular: moderateScale(14),
  medium: moderateScale(16),
  large: moderateScale(18),
  xlarge: moderateScale(20),
  xxlarge: moderateScale(24),
  huge: moderateScale(32),
};

// Spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(32),
};

// Check if device is small
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

// Responsive helper
export const responsive = {
  width: (percentage: number) => (SCREEN_WIDTH * percentage) / 100,
  height: (percentage: number) => (SCREEN_HEIGHT * percentage) / 100,
};
