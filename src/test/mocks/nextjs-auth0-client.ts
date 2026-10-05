import { vi } from "vitest";

export const useUser = vi.fn(() => ({
  user: undefined,
  isLoading: false,
  error: undefined,
  invalidate: vi.fn(),
}));
