import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminProblemsPage from "./page";

vi.mock("@/views/admin/admin-problems-layout", () => ({
  default: () => <div>Admin Problems Layout</div>,
}));

describe("AdminProblemsPage", () => {
  it("renders the admin problems layout", () => {
    render(<AdminProblemsPage />);

    expect(screen.getByText("Admin Problems Layout")).toBeVisible();
  });
});
