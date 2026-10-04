import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProblemSearchInput from "./problem-search-input";
import { useProblemListStore } from "../state/problem-list-store";

const initialState = useProblemListStore.getState();

describe("ProblemSearchInput", () => {
  beforeEach(() => {
    useProblemListStore.setState(initialState, true);
  });

  it("reflects the store's current search value", () => {
    useProblemListStore.setState({ search: "two sum" });

    render(<ProblemSearchInput />);

    expect(
      screen.getByPlaceholderText("Search by title or slug...")
    ).toHaveValue("two sum");
  });

  it("updates the store as the user types", async () => {
    const user = userEvent.setup();
    render(<ProblemSearchInput />);

    await user.type(
      screen.getByPlaceholderText("Search by title or slug..."),
      "two"
    );

    expect(useProblemListStore.getState().search).toBe("two");
  });
});
