import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminSubmissionsPage from "./page";

vi.mock("@/views/admin/admin-submissions-layout", () => ({
  default: () => <div>Admin Submissions Layout</div>,
}));

describe("AdminSubmissionsPage", () => {
  it("renders the admin submissions layout", () => {
    render(<AdminSubmissionsPage />);

    expect(screen.getByText("Admin Submissions Layout")).toBeVisible();
  });
});
