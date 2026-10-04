import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import SelfScoreBadge from "./self-score-badge";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { Game, GameParticipant } from "../models/game";

function buildParticipant(
  overrides: Partial<GameParticipant> = {}
): GameParticipant {
  return {
    userId: "user-1",
    username: "me",
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
    gameModeKey: GameModeKey.SoloRush,
    status: GameStatus.Running,
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    participants: [],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
}

describe("SelfScoreBadge", () => {
  beforeEach(() => {
    resetUserStore();
  });

  it("shows the current user's score", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <SelfScoreBadge
        game={buildGame({
          participants: [buildParticipant({ userId: "user-1", score: 8 })],
        })}
      />
    );

    expect(screen.getByText("8")).toBeVisible();
  });

  it("renders nothing when the current user isn't a participant", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    const { container } = render(
      <SelfScoreBadge game={buildGame({ participants: [] })} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
