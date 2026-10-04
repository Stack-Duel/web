import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { create } from "zustand";
import { useAdminListPagination } from "./use-admin-list-pagination";

interface TestListState {
  pageIndex: number;
  pageSize: number;
  timestamp: string;
  setPagination: (pageIndex: number, pageSize: number) => void;
  resetSession: () => void;
}

const useTestListStore = create<TestListState>((set) => ({
  pageIndex: 2,
  pageSize: 20,
  timestamp: "initial",
  setPagination: (pageIndex, pageSize) => set({ pageIndex, pageSize }),
  resetSession: () => set({ pageIndex: 0, timestamp: "reset" }),
}));

describe("useAdminListPagination", () => {
  beforeEach(() => {
    useTestListStore.setState({
      pageIndex: 2,
      pageSize: 20,
      timestamp: "initial",
    });
  });

  it("resets the session on mount", () => {
    renderHook(() => useAdminListPagination(useTestListStore));

    expect(useTestListStore.getState().pageIndex).toBe(0);
    expect(useTestListStore.getState().timestamp).toBe("reset");
  });

  it("updates the store when pagination changes", () => {
    const { result } = renderHook(() =>
      useAdminListPagination(useTestListStore)
    );

    act(() => {
      result.current.handlePaginationChange({ pageIndex: 3, pageSize: 50 });
    });

    expect(useTestListStore.getState().pageIndex).toBe(3);
    expect(useTestListStore.getState().pageSize).toBe(50);
  });

  it("returns -1 for the page count while data is unavailable", () => {
    const { result } = renderHook(() =>
      useAdminListPagination(useTestListStore)
    );

    expect(result.current.getPageCount(undefined)).toBe(-1);
  });

  it("prefers totalPages from the response when present", () => {
    const { result } = renderHook(() =>
      useAdminListPagination(useTestListStore)
    );

    expect(
      result.current.getPageCount({
        results: [],
        total: 100,
        page: 1,
        size: 20,
        timestamp: "now",
        totalPages: 7,
      })
    ).toBe(7);
  });

  it("falls back to computing the page count from total and pageSize", () => {
    const { result } = renderHook(() =>
      useAdminListPagination(useTestListStore)
    );

    expect(
      result.current.getPageCount({
        results: [],
        total: 45,
        page: 1,
        size: 20,
        timestamp: "now",
      })
    ).toBe(3);
  });
});
