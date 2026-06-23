import { Mock } from 'vitest';

export const mockSetTheme: Mock<(theme: string) => void>;

export function useTheme(): {
  setTheme: (theme: string) => void;
  theme: string | undefined;
  resolvedTheme: string | undefined;
  systemTheme: 'light' | 'dark' | undefined;
  forcedTheme: string | undefined;
  themes: string[];
};

export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactNode;
