import { useColorScheme } from 'react-native';

const light = {
  primary: '#e67e22',
  primaryText: '#ffffff',
  background: '#ffffff',
  surface: '#f7f7f7',
  text: '#1a1a1a',
  textMuted: '#6b7280',
  border: '#cccccc',
  danger: '#dc2626',
  success: '#16a34a',
};

export type ColorPalette = typeof light;

const dark: ColorPalette = {
  primary: '#f39c4a',
  primaryText: '#1a1a1a',
  background: '#121212',
  surface: '#1e1e1e',
  text: '#f2f2f2',
  textMuted: '#9ca3af',
  border: '#3a3a3a',
  danger: '#f87171',
  success: '#4ade80',
};

export const palettes = { light, dark } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 4, md: 8, lg: 12 } as const;
export const fontSize = { sm: 12, md: 14, lg: 16, xl: 20, title: 26 } as const;

export function useTheme() {
  const isDark = useColorScheme() === 'dark';
  return {
    colors: isDark ? palettes.dark : palettes.light,
    spacing,
    radius,
    fontSize,
    isDark,
  };
}