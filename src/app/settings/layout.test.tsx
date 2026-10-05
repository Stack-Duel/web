import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SettingsLayout from "./layout";
import { auth0 } from "@/test/mocks/auth0";
import { redirect } from "@/test/mocks/next-navigation";
import { buildSessionData } from "@/test/factories/session";
import { routerConfig } from "@/shared/router-config";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/shared/lib/auth0", () => import("@/test/mocks/auth0"));
vi.mock("@/views/settings/settings-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Settings Shell: {children}</div>
  ),
}));

describe("SettingsLayout", () => {
  beforeEach(() => {
    redirect.mockClear();
    auth0.getSession.mockReset();
  });

  it("renders the settings shell when a session exists", async () => {
    auth0.getSession.mockResolvedValue(buildSessionData());

    render(await SettingsLayout({ children: <p>Child content</p> }));

    expect(screen.getByText("Child content")).toBeVisible();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects home when there is no session", async () => {
    auth0.getSession.mockResolvedValue(null);

    await expect(
      SettingsLayout({ children: <p>Child content</p> })
    ).rejects.toThrow();

    expect(redirect).toHaveBeenCalledWith(routerConfig.home.path);
  });
});
