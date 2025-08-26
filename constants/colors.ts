// constants/colors.ts
export const COLORS = {
  // Primary colors
  primary: '#2F6FED',
  primaryDark: '#1E4FBB',
  primaryLight: '#5A8BF5',
  
  // Status colors
  success: '#27AE60',
  warning: '#E67E22',
  danger: '#E74C3C',
  
  // Background colors
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  
  // Text colors
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  // Border colors
  border: '#334155',
  borderLight: '#475569',
  
  // Habit colors
  habitColors: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ],
};

export const HABIT_COLORS = COLORS.habitColors;

// constants/layout.ts
export const LAYOUT = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    title: { fontSize: 24, fontWeight: '600' as const },
    subtitle: { fontSize: 18, fontWeight: '500' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 14, fontWeight: '400' as const },
    small: { fontSize: 12, fontWeight: '400' as const },
  },
};
