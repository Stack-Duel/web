import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUserSearchInput from "./admin-user-search-input";
import { useAdminUserListStore } from "../state/admin-user-list-store";

const initialState = useAdminUserListStore.getState();

describe("AdminUserSearchInput", () => {
  beforeEach(() => {
    useAdminUserListStore.setState(initialState, true);
  });

  it("reflects the store's current search value", () => {
    useAdminUserListStore.setState({ search: "alice" });

    render(<AdminUserSearchInput />);

    expect(
      screen.getByPlaceholderText("Search by username or ID...")
    ).toHaveValue("alice");
  });

  it("updates the store as the user types", async () => {
    const user = userEvent.setup();
    render(<AdminUserSearchInput />);

    await user.type(
      screen.getByPlaceholderText("Search by username or ID..."),
      "alice"
    );

    expect(useAdminUserListStore.getState().search).toBe("alice");
  });
});
