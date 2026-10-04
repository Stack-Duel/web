import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import RivalScoreBadge from "./rival-score-badge";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { Game, GameParticipant } from "../models/game";

function buildParticipant(
  overrides: Partial<GameParticipant> = {}
): GameParticipant {
  return {
    userId: "user-1",
    username: "player",
    seatNumber: 0,
    joinedAt: new Date(),
    score: 0,
    hasForfeited: false,
    hasFinishedProblems: false,
    ...overrides,
  };
}

function buildGame(overrides: Partial<Game> = {}): Game {
  return {
    gameId: "game-1",
    gameModeId: "mode-1",
    gameModeKey: GameModeKey.Duel,
    status: GameStatus.Running,
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    participants: [],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
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
