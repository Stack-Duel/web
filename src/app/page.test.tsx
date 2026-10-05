import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home, { metadata } from "./page";
import { auth0 } from "@/test/mocks/auth0";
import { buildSessionData } from "@/test/factories/session";
import { siteName } from "@/test/mocks/site";

vi.mock("@/shared/lib/auth0", () => import("@/test/mocks/auth0"));
vi.mock("@/shared/lib/site", () => import("@/test/mocks/site"));
vi.mock("@/views/dashboard/dashboard-layout", () => ({
  default: () => <div>Dashboard Layout</div>,
}));
vi.mock("@/shared/layouts/layout/layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Marketing Layout: {children}</div>
  ),
}));
vi.mock("@/views/landing/hero", () => ({ default: () => <div>Hero</div> }));
vi.mock("@/views/landing/features-section", () => ({
  default: () => <div>Features</div>,
}));
vi.mock("@/views/landing/cta-section", () => ({
  default: () => <div>Cta</div>,
}));

describe("Home", () => {
  beforeEach(() => {
    auth0.getSession.mockReset();
  });

  it("renders the dashboard for a signed-in visitor", async () => {
    auth0.getSession.mockResolvedValue(buildSessionData());

    render(await Home());

    expect(screen.getByText("Dashboard Layout")).toBeVisible();
  });

  it("renders the marketing landing page for a signed-out visitor", async () => {
    auth0.getSession.mockResolvedValue(null);

    render(await Home());

    expect(screen.getByText("Hero")).toBeVisible();
    expect(screen.getByText("Features")).toBeVisible();
    expect(screen.getByText("Cta")).toBeVisible();
  });
});

describe("metadata", () => {
  it("sets an absolute title so the brand name isn't suffixed twice", () => {
    expect(metadata.title).toEqual({
      absolute: `${siteName} - Real-Time Coding Duels & DSA Practice`,
    });
  });
});
