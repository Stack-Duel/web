import { vi } from "vitest";

export const syncUserMock = vi.fn();
export const retrySyncMock = vi.fn();

export const useUserSync = vi.fn(() => ({
  syncUser: syncUserMock,
  retrySync: retrySyncMock,
}));
