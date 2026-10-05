import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

let changeListener: (() => void) | undefined;

function stubMatchMedia() {
  changeListener = undefined;
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_event: string, listener: () => void) => {
        changeListener = listener;
      },
      removeEventListener: () => {
        changeListener = undefined;
      },
    }))
  );
}

function stubInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
}

describe("useIsMobile", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true when the viewport is narrower than the breakpoint", () => {
    stubInnerWidth(500);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("returns false when the viewport is at or above the breakpoint", () => {
    stubInnerWidth(1024);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("updates when the media query change listener fires", () => {
    stubInnerWidth(1024);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    stubInnerWidth(500);
    act(() => {
      changeListener?.();
    });

    expect(result.current).toBe(true);
  });
});
