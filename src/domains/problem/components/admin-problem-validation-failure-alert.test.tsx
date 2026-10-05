import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminProblemValidationFailureAlert from "./admin-problem-validation-failure-alert";

describe("AdminProblemValidationFailureAlert", () => {
  it("shows the given failure reason", () => {
    render(
      <AdminProblemValidationFailureAlert reason="Bad reference solution." />
    );

    expect(screen.getByText("Validation failed")).toBeVisible();
    expect(screen.getByText("Bad reference solution.")).toBeVisible();
  });

  it("falls back to a generic message when no reason is given", () => {
    render(<AdminProblemValidationFailureAlert reason={null} />);

    expect(
      screen.getByText("The problem failed validation for an unknown reason.")
    ).toBeVisible();
  });
});
