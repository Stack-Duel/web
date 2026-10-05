import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen } from "@testing-library/react";
import ProfileLayout from "./profile-layout";
import { useUser } from "@auth0/nextjs-auth0";
import ProfileContent from "./profile-content";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("./profile-content");
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockProfileContent = vi.mocked(ProfileContent);

function suppressConsoleError() {
  return vi.spyOn(console, "error").mockImplementation(() => {});
}

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("ProfileLayout", () => {
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
    mockProfileContent.mockReturnValue(<p>profile-content</p>);
  });

  it("shows the profile content for the given username", () => {
    render(<ProfileLayout username="ada" />);

    expect(screen.getByText("profile-content")).toBeVisible();
    expect(mockProfileContent).toHaveBeenCalledWith(
      { username: "ada" },
      undefined
    );
  });

  it("shows the username in the breadcrumb", () => {
    render(<ProfileLayout username="ada" />);

    expect(screen.getByText("ada")).toBeVisible();
  });

  it("shows an error fallback with a retry button when the content throws", () => {
    const consoleError = suppressConsoleError();
    mockProfileContent.mockImplementation(() => {
      throw new Error("Failed to load profile");
    });

    render(<ProfileLayout username="ada" />);

    expect(screen.getByText("Failed to load profile")).toBeVisible();
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();

    consoleError.mockRestore();
  });
});
