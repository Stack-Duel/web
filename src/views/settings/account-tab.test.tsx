import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AccountTab from "./account-tab";
import { useUser } from "@auth0/nextjs-auth0";
import { routerConfig } from "@/shared/router-config";
import { buildAuthUser } from "@/test/factories/auth-user";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);

const mockUseUser = vi.mocked(useUser);

describe("AccountTab", () => {
  it("shows a loading skeleton while the auth profile loads", () => {
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: true,
      error: undefined,
      invalidate: vi.fn(),
    });

    render(<AccountTab />);

    expect(screen.queryByText("Account")).not.toBeInTheDocument();
  });

  it("shows the user's name and email once loaded", () => {
    mockUseUser.mockReturnValue({
      user: buildAuthUser({ name: "Ada Lovelace", email: "ada@example.com" }),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });

    render(<AccountTab />);

    expect(screen.getByText("Ada Lovelace")).toBeVisible();
    expect(screen.getByText("ada@example.com")).toBeVisible();
  });

  it("links Log out to the logout route", () => {
    mockUseUser.mockReturnValue({
      user: buildAuthUser(),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });

    render(<AccountTab />);

    expect(screen.getByRole("link", { name: /Log out/ })).toHaveAttribute(
      "href",
      routerConfig.authLogOut.path
    );
  });
});
