import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GameStartingModal from "./game-starting-modal";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { useDuelHeadToHead } from "../../api/get-duel-head-to-head";
import { GameModeKey } from "../../models/game-mode";
import { GameStatus } from "../../models/game";
import type { Game, GameParticipant } from "../../models/game";

vi.mock("../../api/get-duel-head-to-head", () => ({
  useDuelHeadToHead: vi.fn(),
}));

const mockedUseDuelHeadToHead = vi.mocked(useDuelHeadToHead);

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

describe("GameStartingModal", () => {
  beforeEach(() => {
    resetUserStore();
    mockedUseDuelHeadToHead.mockReturnValue({ data: undefined } as never);
  });

  it("shows a VS matchup with the head-to-head record for a Duel", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    mockedUseDuelHeadToHead.mockReturnValue({
      data: { wins: 2, losses: 1, draws: 0, gamesPlayed: 3 },
    } as never);

    render(
      <GameStartingModal
        game={buildGame({
          participants: [
            buildParticipant({ userId: "user-1", username: "me" }),
            buildParticipant({ userId: "user-2", username: "rival" }),
          ],
        })}
        secondsRemaining={4}
      />
    );

    expect(screen.getByText("me (You)")).toBeVisible();
    expect(screen.getByText("rival")).toBeVisible();
    expect(screen.getByText("VS")).toBeVisible();
    expect(screen.getByText("2")).toBeVisible();
    expect(screen.getByText("1")).toBeVisible();
  });

  it("invites a first-time matchup message when the two have never played", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    mockedUseDuelHeadToHead.mockReturnValue({
      data: { wins: 0, losses: 0, draws: 0, gamesPlayed: 0 },
    } as never);

    render(
      <GameStartingModal
        game={buildGame({
          participants: [
            buildParticipant({ userId: "user-1" }),
            buildParticipant({ userId: "user-2", username: "rival" }),
          ],
        })}
        secondsRemaining={4}
      />
    );

    expect(
      screen.getByText("First time playing rival in Duel. Good luck!")
    ).toBeVisible();
  });

  it("lists every competitor without a head-to-head record for FFA", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <GameStartingModal
        game={buildGame({
          gameModeKey: GameModeKey.Ffa,
          participants: [
            buildParticipant({ userId: "user-1", username: "me" }),
            buildParticipant({ userId: "user-2", username: "rival-a" }),
            buildParticipant({ userId: "user-3", username: "rival-b" }),
          ],
        })}
        secondsRemaining={4}
      />
    );

    expect(screen.getByText("me (You)")).toBeVisible();
    expect(screen.getByText("rival-a")).toBeVisible();
    expect(screen.getByText("rival-b")).toBeVisible();
    expect(screen.queryByText("VS")).not.toBeInTheDocument();
  });

  it("counts down to GO! as the final second arrives", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <GameStartingModal
        game={buildGame({
          gameModeKey: GameModeKey.Ffa,
          participants: [buildParticipant({ userId: "user-1" })],
        })}
        secondsRemaining={1}
      />
    );

    expect(screen.getByText("GO!")).toBeInTheDocument();
  });
});
