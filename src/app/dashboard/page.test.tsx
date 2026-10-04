import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";

vi.mock("@/views/dashboard/dashboard-layout", () => ({
  default: () => <div>Dashboard Layout</div>,
}));

describe("DashboardPage", () => {
  it("renders the dashboard layout", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Dashboard Layout")).toBeVisible();
  });
});
