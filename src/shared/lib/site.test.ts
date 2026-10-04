import { describe, expect, it, vi } from "vitest";
import { siteDescription, siteName, siteTagline, siteUrl } from "./site";
import { env } from "@/test/mocks/env";

vi.mock("@/env", () => import("@/test/mocks/env"));

describe("site", () => {
  it("derives the site URL from the app base URL env var", () => {
    expect(siteUrl).toBe(env.APP_BASE_URL);
  });

  it("exposes non-empty site copy", () => {
    expect(siteName).toBe("Algowars");
    expect(siteDescription.length).toBeGreaterThan(0);
    expect(siteTagline.length).toBeGreaterThan(0);
  });
});
