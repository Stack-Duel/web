import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFeatureFlag } from "./use-feature-flag";
import { useFeatureFlags } from "../api/get-feature-flags";

vi.mock("../api/get-feature-flags", () => ({
  useFeatureFlags: vi.fn(),
}));

const mockUseFeatureFlags = vi.mocked(useFeatureFlags);

describe("useFeatureFlag", () => {
  it("returns false while the flags query is loading", () => {
    mockUseFeatureFlags.mockReturnValue({ data: undefined } as never);

    const { result } = renderHook(() => useFeatureFlag("leaderboards"));

    expect(result.current).toBe(false);
  });

  it("returns true when the resolved flags map has the key enabled", () => {
    mockUseFeatureFlags.mockReturnValue({
      data: { leaderboards: true },
    } as never);

    const { result } = renderHook(() => useFeatureFlag("leaderboards"));

    expect(result.current).toBe(true);
  });

  it("returns false when the resolved flags map has the key disabled", () => {
    mockUseFeatureFlags.mockReturnValue({
      data: { leaderboards: false },
    } as never);

    const { result } = renderHook(() => useFeatureFlag("leaderboards"));

    expect(result.current).toBe(false);
  });

  it("fails closed for a key missing from the resolved flags map", () => {
    mockUseFeatureFlags.mockReturnValue({
      data: { "some-other-flag": true },
    } as never);

    const { result } = renderHook(() => useFeatureFlag("leaderboards"));

    expect(result.current).toBe(false);
  });
});
