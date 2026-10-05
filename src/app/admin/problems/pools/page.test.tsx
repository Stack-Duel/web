import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminProblemPoolsPage from "./page";

vi.mock("@/views/admin/admin-problem-pools-layout", () => ({
  default: () => <div>Admin Problem Pools Layout</div>,
}));

describe("AdminProblemPoolsPage", () => {
  it("renders the admin problem pools layout", () => {
    render(<AdminProblemPoolsPage />);

    expect(screen.getByText("Admin Problem Pools Layout")).toBeVisible();
  });
});
