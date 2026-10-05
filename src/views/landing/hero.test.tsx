import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "./hero";
import { routerConfig } from "@/shared/router-config";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildAuthUser } from "@/test/factories/auth-user";

describe("Hero", () => {
  beforeEach(() => {
    resetUserStore();
  });

  it("shows the alpha release badge", () => {
    render(<Hero />);

    expect(screen.getByText("Alpha Release")).toBeVisible();
  });

  it("links Play Now to the sign up route", () => {
    render(<Hero />);

    expect(screen.getByRole("link", { name: "Play Now" })).toHaveAttribute(
      "href",
      routerConfig.authSignUp.path
    );
  });

  it("sends an unauthenticated visitor to sign in with a returnTo back to a duel challenge", () => {
    render(<Hero />);

    expect(
      screen.getByRole("link", { name: "Challenge a friend" })
    ).toHaveAttribute(
      "href",
      `${routerConfig.authLogIn.path}?returnTo=%2Fgames%3Fmode%3Dduel%26challenge%3D1`
    );
  });

  it("sends an authenticated visitor straight to a duel challenge", () => {
    useUserStore.setState({ authProfile: buildAuthUser() });

    render(<Hero />);

    expect(
      screen.getByRole("link", { name: "Challenge a friend" })
    ).toHaveAttribute("href", "/games?mode=duel&challenge=1");
  });
});
