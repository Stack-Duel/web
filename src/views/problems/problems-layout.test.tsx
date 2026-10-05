import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen } from "@testing-library/react";
import ProblemsLayout from "./problems-layout";
import { useUser } from "@auth0/nextjs-auth0";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/domains/problem/tables/problem-table", () => ({
  default: () => <div>problem-table</div>,
}));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("ProblemsLayout", () => {
  beforeEach(() => {
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
  });

  it("renders the problem table inside the sidebar layout", () => {
    render(<ProblemsLayout />);

    expect(screen.getByText("problem-table")).toBeVisible();
    expect(
      screen.getByText("Problems", { selector: '[data-slot="card-title"]' })
    ).toBeVisible();
  });

  it("shows a labeled Discord link in the header", () => {
    render(<ProblemsLayout />);

    const link = screen.getByRole("link", { name: "Join the Discord" });
    expect(link).toHaveAttribute("href", "https://discord.gg/3mW6Y9N5xZ");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
