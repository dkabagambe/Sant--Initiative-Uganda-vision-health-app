import { StyleSheet } from 'react-native';
import { moderateScale, fontSize, screenWidth, verticalScale } from './responsive';

// Global responsive styles that can be used across all screens
export const globalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(100),
  },
  
  // Headers
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: fontSize.large,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: fontSize.small,
    color: '#6B7280',
    marginTop: moderateScale(4),
  },
  
  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: fontSize.medium,
    fontWeight: '700',
    color: '#111827',
    marginBottom: moderateScale(8),
  },
  cardSubtitle: {
    fontSize: fontSize.small,
    color: '#6B7280',
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(24),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(24),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Form inputs
  inputGroup: {
    marginBottom: moderateScale(16),
  },
  label: {
    fontSize: fontSize.regular,
    fontWeight: '600',
    color: '#374151',
    marginBottom: moderateScale(8),
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    fontSize: fontSize.regular,
    color: '#111827',
  },
  inputHint: {
    fontSize: fontSize.small,
    color: '#6B7280',
    marginTop: moderateScale(4),
  },
  
  // Text styles
  title: {
    fontSize: fontSize.xlarge,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: fontSize.regular,
    color: '#6B7280',
  },
  bodyText: {
    fontSize: fontSize.regular,
    color: '#374151',
    lineHeight: fontSize.regular * 1.5,
  },
  
  // Spacing
  spacingXS: { marginBottom: moderateScale(4) },
  spacingSM: { marginBottom: moderateScale(8) },
  spacingMD: { marginBottom: moderateScale(16) },
  spacingLG: { marginBottom: moderateScale(24) },
  spacingXL: { marginBottom: moderateScale(32) },
  
  // Flex utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Bottom navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(12),
  },
  
  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: moderateScale(8),
    height: moderateScale(60),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(8),
  },
  tabLabel: {
    fontSize: fontSize.tiny,
    color: '#666666',
    marginTop: moderateScale(4),
  },
  
  // Progress bar
  progressBar: {
    height: moderateScale(4),
    backgroundColor: '#E5E7EB',
    borderRadius: moderateScale(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: moderateScale(2),
  },
  
  // Badges
  badge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: fontSize.tiny,
    fontWeight: '600',
  },
  
  // Dividers
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: moderateScale(16),
  },
  
  // Empty states
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(60),
  },
  emptyText: {
    fontSize: fontSize.medium,
    color: '#9CA3AF',
    marginTop: moderateScale(16),
    textAlign: 'center',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: fontSize.regular,
    color: '#6B7280',
    marginTop: moderateScale(12),
  },
});

// Responsive breakpoints
export const isSmallScreen = screenWidth < 375;
export const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
export const isLargeScreen = screenWidth >= 768;

// Helper function to get responsive value based on screen size
export const getResponsiveValue = (small: number, medium: number, large: number) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};
