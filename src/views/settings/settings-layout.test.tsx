import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/env", () => import("@/test/mocks/env"));
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen } from "@testing-library/react";
import SettingsShell from "./settings-layout";
import { useUser } from "@auth0/nextjs-auth0";
import { usePathname } from "@/test/mocks/next-navigation";
import { routerConfig } from "@/shared/router-config";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUsePathname = vi.mocked(usePathname);

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("SettingsShell", () => {
  beforeEach(() => {
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
    mockUsePathname.mockReturnValue(routerConfig.settingsProfile.path);
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
  });

  it("renders the settings nav alongside the given children", () => {
    render(
      <SettingsShell>
        <p>Tab content</p>
      </SettingsShell>
    );

    expect(screen.getByRole("link", { name: "Account" })).toBeVisible();
    expect(screen.getByText("Tab content")).toBeVisible();
  });
});
