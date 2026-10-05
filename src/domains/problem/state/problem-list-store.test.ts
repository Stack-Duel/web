import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useProblemListStore } from "./problem-list-store";

const initialState = useProblemListStore.getState();

describe("useProblemListStore", () => {
  beforeEach(() => {
    useProblemListStore.setState(initialState, true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts on the first page with a default page size and empty search", () => {
    const state = useProblemListStore.getState();

    expect(state.pageIndex).toBe(0);
    expect(state.pageSize).toBe(20);
    expect(state.search).toBe("");
  });

  it("updates pagination", () => {
    useProblemListStore.getState().setPagination(1, 10);

    expect(useProblemListStore.getState().pageIndex).toBe(1);
    expect(useProblemListStore.getState().pageSize).toBe(10);
  });

  it("resets the page index to 0 when the search changes", () => {
    useProblemListStore.getState().setPagination(3, 20);

    useProblemListStore.getState().setSearch("two sum");

    expect(useProblemListStore.getState().search).toBe("two sum");
    expect(useProblemListStore.getState().pageIndex).toBe(0);
  });

  it("resets the page index and refreshes the timestamp on resetSession", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    useProblemListStore.getState().setPagination(3, 20);
    const previousTimestamp = useProblemListStore.getState().timestamp;

    vi.setSystemTime(new Date("2026-01-01T00:00:01.000Z"));
    useProblemListStore.getState().resetSession();

    expect(useProblemListStore.getState().pageIndex).toBe(0);
    expect(useProblemListStore.getState().timestamp).not.toBe(
      previousTimestamp
    );
  });
});
