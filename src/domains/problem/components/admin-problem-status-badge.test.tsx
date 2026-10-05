import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminProblemStatusBadge from "./admin-problem-status-badge";

describe("AdminProblemStatusBadge", () => {
  it("renders the status text for each status", () => {
    (["Draft", "Published", "Archived"] as const).forEach((status) => {
      const { unmount } = render(<AdminProblemStatusBadge status={status} />);
      expect(screen.getByText(status)).toBeVisible();
      unmount();
    });
  });

  it("highlights Published in green", () => {
    render(<AdminProblemStatusBadge status="Published" />);

    expect(screen.getByText("Published")).toHaveClass("bg-green-600");
  });

  it("does not highlight Draft or Archived", () => {
    render(<AdminProblemStatusBadge status="Draft" />);
    expect(screen.getByText("Draft")).not.toHaveClass("bg-green-600");
  });
});
