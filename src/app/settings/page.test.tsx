import { beforeEach, describe, expect, it, vi } from "vitest";
import SettingsIndexPage from "./page";
import { redirect } from "@/test/mocks/next-navigation";
import { routerConfig } from "@/shared/router-config";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

describe("SettingsIndexPage", () => {
  beforeEach(() => {
    redirect.mockClear();
  });

  it("redirects to the profile settings page", () => {
    expect(() => SettingsIndexPage()).toThrow();

    expect(redirect).toHaveBeenCalledWith(routerConfig.settingsProfile.path);
  });
});
