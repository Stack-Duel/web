import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AppProviders from "./app-providers";
import { AuthBridge } from "@/domains/auth/auth-bridge";
import { buildSessionData } from "@/test/factories/session";
import { testTenant } from "@/test/mocks/tenant";

vi.mock("@/shared/lib/react-query", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/shared/lib/app-insights", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/domains/auth/auth-bridge", () => ({
  AuthBridge: vi.fn(() => null),
}));
vi.mock("@/domains/tenant/components/tenant-bridge", () => ({
  TenantBridge: () => null,
}));
vi.mock("@/domains/health/components/health-check", () => ({
  default: () => null,
}));
vi.mock("@/shared/components/top-banner", () => ({
  default: () => null,
}));
vi.mock("@/domains/feedback/components/feedback-widget", () => ({
  FeedbackWidget: () => null,
}));

const mockAuthBridge = vi.mocked(AuthBridge);

function suppressConsoleError() {
  return vi.spyOn(console, "error").mockImplementation(() => {});
}

describe("AppProviders", () => {
  it("renders its children", () => {
    render(
      <AppProviders session={null} tenant={testTenant}>
        <p>App content</p>
      </AppProviders>
    );

    expect(screen.getByText("App content")).toBeVisible();
  });

  it("passes the session through to AuthBridge", () => {
    const session = buildSessionData();

    render(
      <AppProviders session={session} tenant={testTenant}>
        <p>App content</p>
      </AppProviders>
    );

    expect(mockAuthBridge).toHaveBeenCalledWith(
      expect.objectContaining({ session }),
      undefined
    );
  });

  it("does not show a sign-in prompt for unauthenticated visitors", () => {
    render(
      <AppProviders session={null} tenant={testTenant}>
        <p>App content</p>
      </AppProviders>
    );

    expect(
      screen.queryByText("Sign in to view this content.")
    ).not.toBeInTheDocument();
  });

  it("shows the error fallback instead of crashing when a child throws", () => {
    const consoleError = suppressConsoleError();

    function Bomb(): ReactNode {
      throw new Error("boom");
    }

    render(
      <AppProviders session={null} tenant={testTenant}>
        <Bomb />
      </AppProviders>
    );

    expect(screen.getByText("Something went wrong")).toBeVisible();

    consoleError.mockRestore();
  });
});
