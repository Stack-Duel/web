import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminProblemPendingBanner from "./admin-problem-pending-banner";

describe("AdminProblemPendingBanner", () => {
  it("shows the validating message", () => {
    render(<AdminProblemPendingBanner />);

    expect(screen.getByText("Validating this problem…")).toBeVisible();
    expect(screen.getByText(/Checking reference solutions/)).toBeVisible();
  });
});
