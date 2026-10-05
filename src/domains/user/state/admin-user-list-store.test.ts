import { beforeEach, describe, expect, it } from "vitest";
import { useAdminUserListStore } from "./admin-user-list-store";

const initialState = useAdminUserListStore.getState();

describe("useAdminUserListStore", () => {
  beforeEach(() => {
    useAdminUserListStore.setState(initialState, true);
  });

  it("starts on the first page with a default page size and empty search", () => {
    const state = useAdminUserListStore.getState();

    expect(state.pageIndex).toBe(0);
    expect(state.pageSize).toBe(20);
    expect(state.search).toBe("");
  });

  it("updates the page index and size", () => {
    useAdminUserListStore.getState().setPagination(2, 50);

    const state = useAdminUserListStore.getState();
    expect(state.pageIndex).toBe(2);
    expect(state.pageSize).toBe(50);
  });

  it("resets the page index to 0 when the search changes", () => {
    useAdminUserListStore.getState().setPagination(3, 20);

    useAdminUserListStore.getState().setSearch("alice");

    expect(useAdminUserListStore.getState().search).toBe("alice");
    expect(useAdminUserListStore.getState().pageIndex).toBe(0);
  });

  it("resets to the first page and refreshes the timestamp", async () => {
    useAdminUserListStore.getState().setPagination(3, 50);
    const previousTimestamp = useAdminUserListStore.getState().timestamp;

    await new Promise((resolve) => setTimeout(resolve, 5));
    useAdminUserListStore.getState().resetSession();

    const state = useAdminUserListStore.getState();
    expect(state.pageIndex).toBe(0);
    expect(state.pageSize).toBe(50);
    expect(state.timestamp).not.toBe(previousTimestamp);
  });
});
