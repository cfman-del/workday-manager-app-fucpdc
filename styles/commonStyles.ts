
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Modern color palette with better contrast and depth
  background: '#FAFBFC',        // Softer light background
  backgroundSecondary: '#F8F9FA', // Secondary background
  surface: '#FFFFFF',           // Pure white for cards
  text: '#1A1D29',             // Rich dark text
  textSecondary: '#6B7280',    // Muted secondary text
  textTertiary: '#9CA3AF',     // Light tertiary text
  primary: '#3B82F6',          // Modern blue
  primaryLight: '#DBEAFE',     // Light blue background
  secondary: '#10B981',        // Modern green
  secondaryLight: '#D1FAE5',   // Light green background
  accent: '#F59E0B',           // Warm amber
  accentLight: '#FEF3C7',      // Light amber background
  error: '#EF4444',            // Modern red
  errorLight: '#FEE2E2',       // Light red background
  warning: '#F59E0B',          // Amber warning
  success: '#10B981',          // Green success
  border: '#E5E7EB',           // Subtle border
  borderLight: '#F3F4F6',      // Very light border
  shadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  
  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  
  // Typography styles
  heading1: {
    fontSize: typography['4xl'],
    fontWeight: typography.extrabold,
    color: colors.text,
    lineHeight: 44,
    fontFamily: 'Inter_800ExtraBold',
  },
  heading2: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.text,
    lineHeight: 38,
    fontFamily: 'Inter_700Bold',
  },
  heading3: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.text,
    lineHeight: 32,
    fontFamily: 'Inter_700Bold',
  },
  heading4: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.text,
    lineHeight: 28,
    fontFamily: 'Inter_600SemiBold',
  },
  body: {
    fontSize: typography.base,
    fontWeight: typography.regular,
    color: colors.text,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  bodyMedium: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
    lineHeight: 24,
    fontFamily: 'Inter_500Medium',
  },
  caption: {
    fontSize: typography.sm,
    fontWeight: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  captionMedium: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'Inter_500Medium',
  },
  
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardElevated: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.md,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
    fontFamily: 'Inter_400Regular',
  },
  inputFocused: {
    borderColor: colors.primary,
    ...shadows.sm,
  },
  
  // Layout helpers
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Spacing utilities
  mt_xs: { marginTop: spacing.xs },
  mt_sm: { marginTop: spacing.sm },
  mt_md: { marginTop: spacing.md },
  mt_lg: { marginTop: spacing.lg },
  mt_xl: { marginTop: spacing.xl },
  
  mb_xs: { marginBottom: spacing.xs },
  mb_sm: { marginBottom: spacing.sm },
  mb_md: { marginBottom: spacing.md },
  mb_lg: { marginBottom: spacing.lg },
  mb_xl: { marginBottom: spacing.xl },
  
  mx_xs: { marginHorizontal: spacing.xs },
  mx_sm: { marginHorizontal: spacing.sm },
  mx_md: { marginHorizontal: spacing.md },
  mx_lg: { marginHorizontal: spacing.lg },
  mx_xl: { marginHorizontal: spacing.xl },
  
  my_xs: { marginVertical: spacing.xs },
  my_sm: { marginVertical: spacing.sm },
  my_md: { marginVertical: spacing.md },
  my_lg: { marginVertical: spacing.lg },
  my_xl: { marginVertical: spacing.xl },
  
  p_xs: { padding: spacing.xs },
  p_sm: { padding: spacing.sm },
  p_md: { padding: spacing.md },
  p_lg: { padding: spacing.lg },
  p_xl: { padding: spacing.xl },
  
  px_xs: { paddingHorizontal: spacing.xs },
  px_sm: { paddingHorizontal: spacing.sm },
  px_md: { paddingHorizontal: spacing.md },
  px_lg: { paddingHorizontal: spacing.lg },
  px_xl: { paddingHorizontal: spacing.xl },
  
  py_xs: { paddingVertical: spacing.xs },
  py_sm: { paddingVertical: spacing.sm },
  py_md: { paddingVertical: spacing.md },
  py_lg: { paddingVertical: spacing.lg },
  py_xl: { paddingVertical: spacing.xl },
});
