import { AppTheme } from '../store/userPreferences/userPreferencesSlice';

/**
 * Applies a theme by setting CSS variables on the document root
 * @param theme The theme configuration to apply
 */
export function applyTheme(theme: AppTheme): void {
  Object.entries(theme.colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });
}

/**
 * Creates a new theme with modified properties
 * @param baseName Base name for the new theme
 * @param baseTheme Theme to use as starting point
 * @param overrides Properties to override in the new theme
 * @returns A new theme object
 */
export function createTheme(
  baseName: string,
  baseTheme: AppTheme,
  overrides: Partial<AppTheme>
): AppTheme {
  return {
    ...baseTheme,
    ...overrides,
    name: baseName,
    colors: {
      ...baseTheme.colors,
      ...(overrides.colors || {})
    }
  };
}