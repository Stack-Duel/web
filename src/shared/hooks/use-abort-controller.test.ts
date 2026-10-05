import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAbortController } from "./use-abort-controller";

describe("useAbortController", () => {
  it("returns an AbortController that starts out not aborted", () => {
    const { result } = renderHook(() => useAbortController());

    expect(result.current).toBeInstanceOf(AbortController);
    expect(result.current.signal.aborted).toBe(false);
  });

  it("keeps the same controller across re-renders with the same deps", () => {
    const { result, rerender } = renderHook(
      ({ deps }) => useAbortController(deps),
      { initialProps: { deps: ["a"] } }
    );
    const first = result.current;

    rerender({ deps: ["a"] });

    expect(result.current).toBe(first);
    expect(first.signal.aborted).toBe(false);
  });

  it("aborts the previous controller and creates a new one when deps change", () => {
    const { result, rerender } = renderHook(
      ({ deps }) => useAbortController(deps),
      { initialProps: { deps: ["a"] } }
    );
    const first = result.current;

    rerender({ deps: ["b"] });

    expect(first.signal.aborted).toBe(true);
    expect(result.current).not.toBe(first);
    expect(result.current.signal.aborted).toBe(false);
  });

  it("aborts the controller on unmount", () => {
    const { result, unmount } = renderHook(() => useAbortController());
    const controller = result.current;
    const abortSpy = vi.spyOn(controller, "abort");

    unmount();

    expect(abortSpy).toHaveBeenCalledOnce();
  });
});
