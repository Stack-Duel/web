import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminProblemPoolDetailPage from "./page";

vi.mock("@/views/admin/admin-problem-pool-detail-layout", () => ({
  default: ({ poolKey }: { poolKey: string }) => (
    <div>Admin Problem Pool Detail Layout: {poolKey}</div>
  ),
}));

describe("AdminProblemPoolDetailPage", () => {
  it("renders the admin problem pool detail layout with the resolved key", async () => {
    render(
      await AdminProblemPoolDetailPage({
        params: Promise.resolve({ key: "daily" }),
      })
    );

    expect(
      screen.getByText("Admin Problem Pool Detail Layout: daily")
    ).toBeVisible();
  });
});
