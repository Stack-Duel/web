import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import FeaturesSection from "./features-section";

describe("FeaturesSection", () => {
  it("renders a card for each feature", () => {
    render(<FeaturesSection />);

    expect(screen.getByText("Leaderboards")).toBeVisible();
    expect(screen.getByText("Multiple languages")).toBeVisible();
    expect(screen.getByText("Competitive games")).toBeVisible();
  });

  it("does not show a demo image on the multiple languages card", () => {
    render(<FeaturesSection />);

    const card = screen.getByText("Multiple languages").closest("section");
    expect(card).not.toBeNull();
    expect(
      within(card as HTMLElement).queryByRole("img")
    ).not.toBeInTheDocument();
  });

  it("shows a demo image on the leaderboards and competitive games cards", () => {
    render(<FeaturesSection />);

    const leaderboardsCard = screen
      .getByText("Leaderboards")
      .closest("section");
    const competitiveGamesCard = screen
      .getByText("Competitive games")
      .closest("section");

    expect(leaderboardsCard).not.toBeNull();
    expect(competitiveGamesCard).not.toBeNull();
    expect(
      within(leaderboardsCard as HTMLElement).getByRole("img")
    ).toHaveAttribute(
      "alt",
      "Algowars leaderboard showing a list of players and their scores"
    );
    expect(
      within(competitiveGamesCard as HTMLElement).getByRole("img")
    ).toHaveAttribute(
      "alt",
      "Algowars competitive programming dashboard showing a live coding duel"
    );
  });
});
