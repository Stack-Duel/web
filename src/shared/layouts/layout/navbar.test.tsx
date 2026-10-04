import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./navbar";
import { routerConfig } from "@/shared/router-config";
import { useUser } from "@auth0/nextjs-auth0";
import { buildAuthUser } from "@/test/factories/auth-user";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);

const mockUseUser = vi.mocked(useUser);

describe("Navbar", () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
  });

  it("shows the primary navigation links", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      routerConfig.home.path
    );
    expect(screen.getByRole("link", { name: "Problems" })).toHaveAttribute(
      "href",
      routerConfig.problems.path
    );
    expect(screen.getByRole("link", { name: "Games" })).toHaveAttribute(
      "href",
      routerConfig.games.path
    );
    expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute(
      "href",
      routerConfig.community.path
    );
  });

  it("links to the Discord invite, opened in a new tab", () => {
    render(<Navbar />);

    const link = screen.getByRole("link", { name: "Join our Discord" });
    expect(link).toHaveAttribute("href", "https://discord.gg/3mW6Y9N5xZ");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows Login and Get Started when the user is unauthenticated", () => {
    render(<Navbar />);

    expect(screen.getByTestId("sign-in-button")).toHaveAttribute(
      "href",
      routerConfig.authLogIn.path
    );
    expect(screen.getByTestId("sign-up-button")).toHaveAttribute(
      "href",
      routerConfig.authSignUp.path
    );
  });

  it("shows Profile and Log Out when the user is authenticated", () => {
    mockUseUser.mockReturnValue({
      user: buildAuthUser(),
      isLoading: false,
      error: null,
      invalidate: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      routerConfig.profile.path
    );
    expect(screen.getByRole("link", { name: "Log Out" })).toHaveAttribute(
      "href",
      routerConfig.authLogOut.path
    );
    expect(screen.queryByTestId("sign-in-button")).not.toBeInTheDocument();
  });

  it("opens the mobile navigation menu with a sign up prompt for guests", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(
      screen.getByRole("button", { name: "Open navigation menu" })
    );

    expect(screen.getByText("Join the algowars community")).toBeVisible();
  });
});
