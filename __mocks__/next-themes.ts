import { vi } from 'vitest';

export const mockSetTheme = vi.fn();

export function useTheme() {
  return {
    setTheme: mockSetTheme,
    theme: 'light',
    resolvedTheme: 'light',
    systemTheme: 'light',
    forcedTheme: undefined,
    themes: ['light', 'dark', 'system'],
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return children;
}
