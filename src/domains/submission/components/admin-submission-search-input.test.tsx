import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminSubmissionSearchInput, {
  isValidGuid,
} from "./admin-submission-search-input";
import { useAdminSubmissionListStore } from "../state/admin-submission-list-store";

const initialState = useAdminSubmissionListStore.getState();

describe("isValidGuid", () => {
  it("accepts a standard GUID", () => {
    expect(isValidGuid("11111111-1111-1111-1111-111111111111")).toBe(true);
  });

  it("accepts a GUID regardless of case", () => {
    expect(isValidGuid("AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE")).toBe(true);
  });

  it("rejects a non-GUID string", () => {
    expect(isValidGuid("not-a-guid")).toBe(false);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isValidGuid("  11111111-1111-1111-1111-111111111111  ")).toBe(true);
  });
});

describe("AdminSubmissionSearchInput", () => {
  beforeEach(() => {
    useAdminSubmissionListStore.setState(initialState, true);
  });

  it("updates the store as the user types", async () => {
    const user = userEvent.setup();
    render(<AdminSubmissionSearchInput />);

    await user.type(
      screen.getByPlaceholderText("Search by submission ID..."),
      "abc"
    );

    expect(useAdminSubmissionListStore.getState().searchId).toBe("abc");
  });

  it("shows no error for an empty search", () => {
    render(<AdminSubmissionSearchInput />);

    expect(
      screen.queryByText(/Not a valid submission ID/)
    ).not.toBeInTheDocument();
  });

  it("flags an invalid, non-empty search id", async () => {
    const user = userEvent.setup();
    render(<AdminSubmissionSearchInput />);

    await user.type(
      screen.getByPlaceholderText("Search by submission ID..."),
      "not-a-guid"
    );

    expect(screen.getByText(/Not a valid submission ID/)).toBeVisible();
    expect(
      screen.getByPlaceholderText("Search by submission ID...")
    ).toHaveAttribute("aria-invalid", "true");
  });

  it("does not flag a valid GUID", async () => {
    const user = userEvent.setup();
    render(<AdminSubmissionSearchInput />);

    await user.type(
      screen.getByPlaceholderText("Search by submission ID..."),
      "11111111-1111-1111-1111-111111111111"
    );

    expect(
      screen.queryByText(/Not a valid submission ID/)
    ).not.toBeInTheDocument();
  });
});
