import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthGuardFallback } from "./auth-guard-fallback";
import { usePathname } from "@/test/mocks/next-navigation";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

describe("AuthGuardFallback", () => {
  it("shows a forbidden message when reason is forbidden", () => {
    render(<AuthGuardFallback reason="forbidden" />);

    expect(
      screen.getByText("You don't have permission to view this.")
    ).toBeVisible();
  });

  it("shows a sign-in prompt with a returnTo link when reason is unauthenticated", () => {
    usePathname.mockReturnValue("/settings/account");

    render(<AuthGuardFallback reason="unauthenticated" />);

    expect(screen.getByText("Sign in to view this content.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/auth/login?returnTo=%2Fsettings%2Faccount"
    );
  });
});
