import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePoolAddSelection } from "./use-pool-add-selection";

describe("usePoolAddSelection", () => {
  it("starts empty in explicit mode", () => {
    const { result } = renderHook(() => usePoolAddSelection());

    expect(result.current.selection).toEqual({
      mode: "explicit",
      rowSelection: {},
    });
    expect(result.current.selectedCount(10)).toBe(0);
  });

  it("selects rows on the current page in explicit mode", () => {
    const { result } = renderHook(() => usePoolAddSelection());

    act(() =>
      result.current.onRowSelectionChange(["a", "b", "c"], { a: true, b: true })
    );

    expect(result.current.rowSelection(["a", "b", "c"])).toEqual({
      a: true,
      b: true,
    });
    expect(result.current.selectedCount(10)).toBe(2);
    expect(result.current.isAllOnPageSelected(["a", "b"])).toBe(true);
    expect(result.current.isAllOnPageSelected(["a", "b", "c"])).toBe(false);
  });

  it("keeps selections from a previous page when the page changes", () => {
    const { result } = renderHook(() => usePoolAddSelection());

    act(() => result.current.onRowSelectionChange(["a", "b"], { a: true }));
    act(() =>
      result.current.onRowSelectionChange(["c", "d"], (prev) => ({
        ...prev,
        c: true,
      }))
    );

    expect(result.current.selectedCount(10)).toBe(2);
    expect(result.current.rowSelection(["a", "b", "c", "d"])).toEqual({
      a: true,
      c: true,
    });
  });

  it("selectAllMatching switches to all-matching mode with nothing excluded", () => {
    const { result } = renderHook(() => usePoolAddSelection());

    act(() => result.current.selectAllMatching());

    expect(result.current.selection).toEqual({
      mode: "all-matching",
      excludedIds: new Set(),
    });
    expect(result.current.selectedCount(50)).toBe(50);
    expect(result.current.rowSelection(["a", "b"])).toEqual({
      a: true,
      b: true,
    });
  });

  it("unchecking a row while all-matching excludes just that row", () => {
    const { result } = renderHook(() => usePoolAddSelection());

    act(() => result.current.selectAllMatching());
    act(() =>
      result.current.onRowSelectionChange(["a", "b"], { a: true, b: false })
    );

    expect(result.current.selectedCount(50)).toBe(49);
    expect(result.current.rowSelection(["a", "b"])).toEqual({
      a: true,
      b: false,
    });
    expect(result.current.selection).toEqual({
      mode: "all-matching",
      excludedIds: new Set(["b"]),
    });
  });

  it("re-checking a previously excluded row while all-matching removes the exclusion", () => {
    const { result } = renderHook(() => usePoolAddSelection());

    act(() => result.current.selectAllMatching());
    act(() => result.current.onRowSelectionChange(["a"], { a: false }));
    act(() => result.current.onRowSelectionChange(["a"], { a: true }));

    expect(result.current.selection).toEqual({
      mode: "all-matching",
      excludedIds: new Set(),
    });
    expect(result.current.selectedCount(50)).toBe(50);
  });

  it("clear resets to empty explicit mode from either mode", () => {
    const { result } = renderHook(() => usePoolAddSelection());

    act(() => result.current.selectAllMatching());
    act(() => result.current.clear());

    expect(result.current.selection).toEqual({
      mode: "explicit",
      rowSelection: {},
    });
  });
});
