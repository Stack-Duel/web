import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminProblemListStore } from "./admin-problem-list-store";

const initialState = useAdminProblemListStore.getState();

describe("useAdminProblemListStore", () => {
  beforeEach(() => {
    useAdminProblemListStore.setState(initialState, true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts on the first page with a default page size and empty search", () => {
    const state = useAdminProblemListStore.getState();

    expect(state.pageIndex).toBe(0);
    expect(state.pageSize).toBe(20);
    expect(state.search).toBe("");
  });

  it("updates pagination", () => {
    useAdminProblemListStore.getState().setPagination(2, 50);

    expect(useAdminProblemListStore.getState().pageIndex).toBe(2);
    expect(useAdminProblemListStore.getState().pageSize).toBe(50);
  });

  it("resets the page index to 0 when the search changes", () => {
    useAdminProblemListStore.getState().setPagination(3, 20);

    useAdminProblemListStore.getState().setSearch("two sum");

    expect(useAdminProblemListStore.getState().search).toBe("two sum");
    expect(useAdminProblemListStore.getState().pageIndex).toBe(0);
  });

  it("resets the page index and refreshes the timestamp on resetSession", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    useAdminProblemListStore.getState().setPagination(3, 20);
    const previousTimestamp = useAdminProblemListStore.getState().timestamp;

    vi.setSystemTime(new Date("2026-01-01T00:00:01.000Z"));
    useAdminProblemListStore.getState().resetSession();

    expect(useAdminProblemListStore.getState().pageIndex).toBe(0);
    expect(useAdminProblemListStore.getState().timestamp).not.toBe(
      previousTimestamp
    );
  });
});
