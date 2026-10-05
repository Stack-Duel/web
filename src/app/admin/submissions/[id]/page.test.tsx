import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminSubmissionDetailPage from "./page";

vi.mock("@/views/admin/admin-submission-detail-layout", () => ({
  default: ({ id }: { id: string }) => (
    <div>Admin Submission Detail Layout: {id}</div>
  ),
}));

describe("AdminSubmissionDetailPage", () => {
  it("renders the admin submission detail layout with the resolved id", async () => {
    render(
      await AdminSubmissionDetailPage({
        params: Promise.resolve({ id: "submission-1" }),
      })
    );

    expect(
      screen.getByText("Admin Submission Detail Layout: submission-1")
    ).toBeVisible();
  });
});
