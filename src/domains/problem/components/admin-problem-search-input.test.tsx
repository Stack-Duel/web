import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminProblemSearchInput from "./admin-problem-search-input";
import { useAdminProblemListStore } from "../state/admin-problem-list-store";

const initialState = useAdminProblemListStore.getState();

describe("AdminProblemSearchInput", () => {
  beforeEach(() => {
    useAdminProblemListStore.setState(initialState, true);
  });

  it("reflects the store's current search value", () => {
    useAdminProblemListStore.setState({ search: "two sum" });

    render(<AdminProblemSearchInput />);

    expect(
      screen.getByPlaceholderText("Search by title, slug, or ID...")
    ).toHaveValue("two sum");
  });

  it("updates the store as the user types", async () => {
    const user = userEvent.setup();
    render(<AdminProblemSearchInput />);

    await user.type(
      screen.getByPlaceholderText("Search by title, slug, or ID..."),
      "two"
    );

    expect(useAdminProblemListStore.getState().search).toBe("two");
  });
});
