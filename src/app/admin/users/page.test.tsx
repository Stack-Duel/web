import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminUsersPage from "./page";

vi.mock("@/views/admin/admin-users-layout", () => ({
  default: () => <div>Admin Users Layout</div>,
}));

describe("AdminUsersPage", () => {
  it("renders the admin users layout", () => {
    render(<AdminUsersPage />);

    expect(screen.getByText("Admin Users Layout")).toBeVisible();
  });
});
