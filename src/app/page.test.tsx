import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home, { generateMetadata } from "./page";
import { auth0 } from "@/test/mocks/auth0";
import { buildSessionData } from "@/test/factories/session";
import { testTenant } from "@/test/mocks/tenant";

vi.mock("@/shared/lib/auth0", () => import("@/test/mocks/auth0"));
vi.mock(
  "@/domains/tenant/lib/get-current-tenant",
  () => import("@/test/mocks/tenant")
);
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
vi.mock("@/views/landing/faq-section", () => ({
  default: () => <div>Faq</div>,
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
    expect(screen.getByText("Faq")).toBeVisible();
    expect(screen.getByText("Cta")).toBeVisible();
  });
});

describe("metadata", () => {
  it("sets an absolute title so the brand name isn't suffixed twice", async () => {
    const metadata = await generateMetadata();

    expect(metadata.title).toEqual({
      absolute: `${testTenant.name} - Real-Time Coding Duels & DSA Practice`,
    });
  });
});
