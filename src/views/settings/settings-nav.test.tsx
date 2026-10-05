import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsNav from "./settings-nav";
import { routerMock, usePathname } from "@/test/mocks/next-navigation";
import { routerConfig } from "@/shared/router-config";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockUsePathname = vi.mocked(usePathname);

describe("SettingsNav", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
  });

  it("links each nav item to its settings route", () => {
    mockUsePathname.mockReturnValue(routerConfig.settingsProfile.path);

    render(<SettingsNav />);

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      routerConfig.settingsProfile.path
    );
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      routerConfig.settingsAccount.path
    );
    expect(screen.getByRole("link", { name: "Preferences" })).toHaveAttribute(
      "href",
      routerConfig.settingsPreferences.path
    );
  });

  it("highlights the link matching the current path", () => {
    mockUsePathname.mockReturnValue(routerConfig.settingsAccount.path);

    render(<SettingsNav />);

    expect(screen.getByRole("link", { name: "Account" })).toHaveClass(
      "bg-muted"
    );
    expect(screen.getByRole("link", { name: "Profile" })).not.toHaveClass(
      "bg-muted"
    );
  });

  it("navigates when a mobile tab is selected", async () => {
    mockUsePathname.mockReturnValue(routerConfig.settingsProfile.path);
    const user = userEvent.setup();

    render(<SettingsNav />);

    await user.click(screen.getByRole("tab", { name: "Preferences" }));

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.settingsPreferences.path
    );
  });
});
