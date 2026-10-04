import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminProblemDetailPage from "./page";

vi.mock("@/views/admin/admin-problem-detail-layout", () => ({
  default: ({ id }: { id: string }) => (
    <div>Admin Problem Detail Layout: {id}</div>
  ),
}));

describe("AdminProblemDetailPage", () => {
  it("renders the admin problem detail layout with the resolved id", async () => {
    render(
      await AdminProblemDetailPage({
        params: Promise.resolve({ id: "problem-1" }),
      })
    );

    expect(
      screen.getByText("Admin Problem Detail Layout: problem-1")
    ).toBeVisible();
  });
});
