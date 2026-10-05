import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminDailyChallengesPage from "./page";

vi.mock("@/views/admin/admin-daily-challenges-layout", () => ({
  default: () => <div>Admin Daily Challenges Layout</div>,
}));

describe("AdminDailyChallengesPage", () => {
  it("renders the admin daily challenges layout", () => {
    render(<AdminDailyChallengesPage />);

    expect(screen.getByText("Admin Daily Challenges Layout")).toBeVisible();
  });
});
