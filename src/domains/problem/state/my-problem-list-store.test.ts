import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMyProblemListStore } from "./my-problem-list-store";

const initialState = useMyProblemListStore.getState();

describe("useMyProblemListStore", () => {
  beforeEach(() => {
    useMyProblemListStore.setState(initialState, true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with no status filter and page 1", () => {
    const state = useMyProblemListStore.getState();

    expect(state.statusFilter).toEqual([]);
    expect(state.pageIndex).toBe(0);
  });

  it("toggleStatusFilter adds a status and resets to page 0", () => {
    useMyProblemListStore.setState({ pageIndex: 2 });

    useMyProblemListStore.getState().toggleStatusFilter("Draft");

    expect(useMyProblemListStore.getState().statusFilter).toEqual(["Draft"]);
    expect(useMyProblemListStore.getState().pageIndex).toBe(0);
  });

  it("toggleStatusFilter removes a status that's already selected", () => {
    useMyProblemListStore.setState({ statusFilter: ["Draft", "Pending"] });

    useMyProblemListStore.getState().toggleStatusFilter("Draft");

    expect(useMyProblemListStore.getState().statusFilter).toEqual(["Pending"]);
  });

  it("setStatusFilter replaces the whole selection and resets to page 0", () => {
    useMyProblemListStore.setState({
      statusFilter: ["Draft"],
      pageIndex: 3,
    });

    useMyProblemListStore.getState().setStatusFilter([]);

    expect(useMyProblemListStore.getState().statusFilter).toEqual([]);
    expect(useMyProblemListStore.getState().pageIndex).toBe(0);
  });

  it("setSearch resets to page 0", () => {
    useMyProblemListStore.setState({ pageIndex: 1 });

    useMyProblemListStore.getState().setSearch("two sum");

    expect(useMyProblemListStore.getState().search).toBe("two sum");
    expect(useMyProblemListStore.getState().pageIndex).toBe(0);
  });

  it("resetSession resets the page index and refreshes the timestamp", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    useMyProblemListStore.setState({ pageIndex: 4 });
    const previousTimestamp = useMyProblemListStore.getState().timestamp;

    vi.setSystemTime(new Date("2026-01-01T00:00:01.000Z"));
    useMyProblemListStore.getState().resetSession();

    expect(useMyProblemListStore.getState().pageIndex).toBe(0);
    expect(useMyProblemListStore.getState().timestamp).not.toBe(
      previousTimestamp
    );
  });
});
