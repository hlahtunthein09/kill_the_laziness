import { vi } from 'vitest';

export const mockPush = vi.fn();

export function useRouter() {
  return {
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  };
}
