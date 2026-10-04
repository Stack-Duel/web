import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./footer";
import { routerConfig } from "@/shared/router-config";

describe("Footer", () => {
  it("shows the current year in the copyright line", () => {
    render(<Footer />);

    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeVisible();
  });

  it("links the platform section to the real app routes", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Problems" })).toHaveAttribute(
      "href",
      routerConfig.problems.path
    );
    expect(screen.getByRole("link", { name: "Games" })).toHaveAttribute(
      "href",
      routerConfig.games.path
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      routerConfig.dashboard.path
    );
  });

  it("links the account section to login, sign up, and profile settings", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      routerConfig.authLogIn.path
    );
    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
      "href",
      routerConfig.authSignUp.path
    );
    expect(
      screen.getByRole("link", { name: "Profile Settings" })
    ).toHaveAttribute("href", routerConfig.profileSettings.path);
  });

  it("links to the Discord, GitHub, and LinkedIn accounts, opened in a new tab", () => {
    render(<Footer />);

    for (const [name, href] of [
      ["Discord", "https://discord.gg/3mW6Y9N5xZ"],
      ["GitHub", "https://github.com/algowars"],
      ["LinkedIn", "https://www.linkedin.com/company/106262028/"],
    ]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
