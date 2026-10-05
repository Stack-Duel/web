import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminSubmissionListStore } from "./admin-submission-list-store";

const initialState = useAdminSubmissionListStore.getState();

describe("useAdminSubmissionListStore", () => {
  beforeEach(() => {
    useAdminSubmissionListStore.setState(initialState, true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts on the first page with a default page size and empty search id", () => {
    const state = useAdminSubmissionListStore.getState();

    expect(state.pageIndex).toBe(0);
    expect(state.pageSize).toBe(20);
    expect(state.searchId).toBe("");
  });

  it("updates pagination", () => {
    useAdminSubmissionListStore.getState().setPagination(2, 50);

    expect(useAdminSubmissionListStore.getState().pageIndex).toBe(2);
    expect(useAdminSubmissionListStore.getState().pageSize).toBe(50);
  });

  it("resets the page index to 0 when the search id changes", () => {
    useAdminSubmissionListStore.getState().setPagination(3, 20);

    useAdminSubmissionListStore
      .getState()
      .setSearchId("11111111-1111-1111-1111-111111111111");

    expect(useAdminSubmissionListStore.getState().searchId).toBe(
      "11111111-1111-1111-1111-111111111111"
    );
    expect(useAdminSubmissionListStore.getState().pageIndex).toBe(0);
  });

  it("resets the page index and refreshes the timestamp on resetSession", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    useAdminSubmissionListStore.getState().setPagination(3, 20);
    const previousTimestamp = useAdminSubmissionListStore.getState().timestamp;

    vi.setSystemTime(new Date("2026-01-01T00:00:01.000Z"));
    useAdminSubmissionListStore.getState().resetSession();

    expect(useAdminSubmissionListStore.getState().pageIndex).toBe(0);
    expect(useAdminSubmissionListStore.getState().timestamp).not.toBe(
      previousTimestamp
    );
  });
});
