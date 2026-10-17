import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import RivalScoreBadge from "./rival-score-badge";
import { GameModeKey } from "../models/game-mode";
import type { Game, GameParticipant } from "../models/game";
import {
  buildParticipant as baseBuildParticipant,
  buildGame as baseBuildGame,
} from "@/test/factories/game";

function buildParticipant(
  overrides: Partial<GameParticipant> = {}
): GameParticipant {
  return baseBuildParticipant({ username: "player", ...overrides });
}

function buildGame(overrides: Partial<Game> = {}): Game {
  return baseBuildGame({ gameModeKey: GameModeKey.Duel, ...overrides });
}

describe("RivalScoreBadge", () => {
  it("renders nothing for solo rush (fewer than 2 participants)", () => {
    const { container } = render(
      <RivalScoreBadge
        game={buildGame({ participants: [buildParticipant()] })}
        currentUserId="user-1"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the opponent's username and score in a duel", () => {
    render(
      <RivalScoreBadge
        game={buildGame({
          participants: [
            buildParticipant({ userId: "user-1", score: 5 }),
            buildParticipant({
              userId: "user-2",
              username: "rival",
              score: 8,
            }),
          ],
        })}
        currentUserId="user-1"
      />
    );

    expect(screen.getByText("rival:")).toBeVisible();
    expect(screen.getByText("8")).toBeVisible();
  });

  it("shows the leader's score as 1st place when the current user is behind, in FFA", () => {
    render(
      <RivalScoreBadge
        game={buildGame({
          gameModeKey: GameModeKey.Ffa,
          participants: [
            buildParticipant({ userId: "user-1", score: 3 }),
            buildParticipant({ userId: "user-2", score: 10 }),
            buildParticipant({ userId: "user-3", score: 5 }),
          ],
        })}
        currentUserId="user-1"
      />
    );

    expect(screen.getByText("1st:")).toBeVisible();
    expect(screen.getByText("10")).toBeVisible();
  });

  it("shows the runner-up's score as 2nd when the current user is leading, in FFA", () => {
    render(
      <RivalScoreBadge
        game={buildGame({
          gameModeKey: GameModeKey.Ffa,
          participants: [
            buildParticipant({ userId: "user-1", score: 10 }),
            buildParticipant({ userId: "user-2", score: 4 }),
            buildParticipant({ userId: "user-3", score: 7 }),
          ],
        })}
        currentUserId="user-1"
      />
    );

    expect(screen.getByText("2nd:")).toBeVisible();
    expect(screen.getByText("7")).toBeVisible();
  });

  it("counts a tie for first as leading, showing the tied opponent's score", () => {
    render(
      <RivalScoreBadge
        game={buildGame({
          gameModeKey: GameModeKey.Ffa,
          participants: [
            buildParticipant({ userId: "user-1", score: 10 }),
            buildParticipant({ userId: "user-2", score: 10 }),
            buildParticipant({ userId: "user-3", score: 7 }),
          ],
        })}
        currentUserId="user-1"
      />
    );

    expect(screen.getByText("1st:")).toBeVisible();
    expect(screen.getByText("10")).toBeVisible();
  });
});
