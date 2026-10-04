import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminUserDetailPage from "./page";

vi.mock("@/views/admin/admin-user-detail-layout", () => ({
  default: ({ id }: { id: string }) => (
    <div>Admin User Detail Layout: {id}</div>
  ),
}));

describe("AdminUserDetailPage", () => {
  it("renders the admin user detail layout with the resolved id", async () => {
    render(
      await AdminUserDetailPage({
        params: Promise.resolve({ id: "user-1" }),
      })
    );

    expect(screen.getByText("Admin User Detail Layout: user-1")).toBeVisible();
  });
});
