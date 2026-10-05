import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UserSetupPage from "./page";
import { auth0 } from "@/test/mocks/auth0";
import { redirect } from "@/test/mocks/next-navigation";
import { buildSessionData } from "@/test/factories/session";
import { routerConfig } from "@/shared/router-config";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/shared/lib/auth0", () => import("@/test/mocks/auth0"));
vi.mock("@/views/user/setup/user-setup-layout", () => ({
  default: () => <div>User Setup Layout</div>,
}));

describe("UserSetupPage", () => {
  beforeEach(() => {
    redirect.mockClear();
    auth0.getSession.mockReset();
  });

  it("renders the setup layout when a session exists", async () => {
    auth0.getSession.mockResolvedValue(buildSessionData());

    render(await UserSetupPage());

    expect(screen.getByText("User Setup Layout")).toBeVisible();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects home when there is no session", async () => {
    auth0.getSession.mockResolvedValue(null);

    await expect(UserSetupPage()).rejects.toThrow();

    expect(redirect).toHaveBeenCalledWith(routerConfig.home.path);
  });
});
