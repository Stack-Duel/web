import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GameOverSummary from "./game-over-summary";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { useCreateGameAndPlay } from "@/domains/game/hooks/use-create-game-and-play";
import { useTracks } from "@/domains/game/api/use-tracks";
import { useMyLeaderboardEntry } from "@/domains/leaderboard/api/get-my-leaderboard-entry";
import { fireHighScoreConfetti } from "@/shared/lib/confetti";
import { GameModeKey } from "@/domains/game/models/game-mode";
import { GameStatus } from "@/domains/game/models/game";
import type { Game, GameParticipant } from "@/domains/game/models/game";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/game/hooks/use-create-game-and-play", () => ({
  useCreateGameAndPlay: vi.fn(),
}));
vi.mock("@/domains/game/api/use-tracks", () => ({ useTracks: vi.fn() }));
vi.mock("@/domains/leaderboard/api/get-my-leaderboard-entry", () => ({
  useMyLeaderboardEntry: vi.fn(),
}));
vi.mock("@/shared/lib/confetti", () => ({
  fireHighScoreConfetti: vi.fn(),
}));

const mockedUseCreateGameAndPlay = vi.mocked(useCreateGameAndPlay);
const mockedUseTracks = vi.mocked(useTracks);
const mockedUseMyLeaderboardEntry = vi.mocked(useMyLeaderboardEntry);
const mockedFireHighScoreConfetti = vi.mocked(fireHighScoreConfetti);

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
    gameModeKey: GameModeKey.SoloRush,
    status: GameStatus.Completed,
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    participants: [],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
}

function renderSummary(game: Game) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <GameOverSummary game={game} />
    </QueryClientProvider>
  );
}

describe("GameOverSummary", () => {
  beforeEach(() => {
    resetUserStore();
    localStorage.setItem(
      "algowars:has-seen-first-game-feedback-prompt",
      "true"
    );
    mockedUseCreateGameAndPlay.mockReturnValue({
      createGame: vi.fn(),
      isCreating: false,
    });
    mockedUseTracks.mockReturnValue({
      data: [
        {
          id: "track-gp",
          key: "general-purpose",
          name: "General Purpose",
          allowsLanguageSelection: true,
          languages: [{ id: "lang-js", name: "JavaScript" }],
        },
      ],
    } as never);
    mockedUseMyLeaderboardEntry.mockReturnValue({ data: undefined } as never);
    mockedFireHighScoreConfetti.mockClear();
  });

  it("shows a lobby-closed card when the game was cancelled", () => {
    renderSummary(buildGame({ status: GameStatus.Cancelled }));

    expect(screen.getByText("Lobby closed")).toBeVisible();
    expect(
      screen.getByText("This lobby was closed before the game started.")
    ).toBeVisible();
  });

  it("shows a forfeited title for a solo game the player forfeited", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        participants: [
          buildParticipant({ userId: "user-1", hasForfeited: true }),
        ],
      })
    );

    expect(screen.getByText("Game forfeited")).toBeVisible();
    expect(screen.getByText("This game has ended.")).toBeVisible();
  });

  it("shows an all-solved title for a solo game the player finished", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        participants: [
          buildParticipant({
            userId: "user-1",
            hasFinishedProblems: true,
          }),
        ],
      })
    );

    expect(screen.getByText("All problems solved!")).toBeVisible();
  });

  it("shows a time's-up title for a solo game that just ran out of time", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        participants: [buildParticipant({ userId: "user-1" })],
      })
    );

    expect(screen.getByText("Time's up")).toBeVisible();
  });

  it("declares the current user the winner in a multiplayer game", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        gameModeKey: GameModeKey.Duel,
        participants: [
          buildParticipant({ userId: "user-1", score: 10 }),
          buildParticipant({
            userId: "user-2",
            username: "opponent",
            score: 4,
          }),
        ],
      })
    );

    expect(screen.getByText("You won!")).toBeVisible();
  });

  it("names the opponent as the winner when the current user lost", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        gameModeKey: GameModeKey.Duel,
        participants: [
          buildParticipant({ userId: "user-1", score: 4 }),
          buildParticipant({
            userId: "user-2",
            username: "opponent",
            score: 10,
          }),
        ],
      })
    );

    expect(screen.getByText("opponent won with 10 points.")).toBeVisible();
  });

  it("reports a tie the current user shares as first place", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        gameModeKey: GameModeKey.Ffa,
        participants: [
          buildParticipant({ userId: "user-1", score: 8 }),
          buildParticipant({
            userId: "user-2",
            username: "opponent",
            score: 8,
          }),
        ],
      })
    );

    expect(screen.getByText("Tied for first at 8 points.")).toBeVisible();
  });

  it("names the tied players when the current user is not among them", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        gameModeKey: GameModeKey.Ffa,
        participants: [
          buildParticipant({ userId: "user-1", score: 2 }),
          buildParticipant({
            userId: "user-2",
            username: "riva",
            score: 8,
          }),
          buildParticipant({
            userId: "user-3",
            username: "lorne",
            score: 8,
          }),
        ],
      })
    );

    expect(
      screen.getByText("riva and lorne tied for first at 8 points.")
    ).toBeVisible();
  });

  it("celebrates a new high score with confetti and a badge", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    mockedUseMyLeaderboardEntry.mockReturnValue({
      data: { highScore: 10 },
    } as never);

    renderSummary(
      buildGame({
        participants: [buildParticipant({ userId: "user-1", score: 10 })],
      })
    );

    expect(screen.getByText("New High Score!")).toBeVisible();
    expect(mockedFireHighScoreConfetti).toHaveBeenCalledTimes(1);
  });

  it("does not celebrate when the score falls short of the personal best", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    mockedUseMyLeaderboardEntry.mockReturnValue({
      data: { highScore: 20 },
    } as never);

    renderSummary(
      buildGame({
        participants: [buildParticipant({ userId: "user-1", score: 10 })],
      })
    );

    expect(screen.queryByText("New High Score!")).not.toBeInTheDocument();
    expect(mockedFireHighScoreConfetti).not.toHaveBeenCalled();
  });

  it("shows a trophy flourish for a clean multiplayer win", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        gameModeKey: GameModeKey.Duel,
        participants: [
          buildParticipant({ userId: "user-1", score: 10 }),
          buildParticipant({
            userId: "user-2",
            username: "opponent",
            score: 4,
          }),
        ],
      })
    );

    expect(screen.getByText("Victory")).toBeInTheDocument();
  });

  it("does not show a trophy flourish for a tie or a loss", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        gameModeKey: GameModeKey.Duel,
        participants: [
          buildParticipant({ userId: "user-1", score: 4 }),
          buildParticipant({
            userId: "user-2",
            username: "opponent",
            score: 10,
          }),
        ],
      })
    );

    expect(screen.queryByText("Victory")).not.toBeInTheDocument();
  });

  it("does not declare a winner when the player forfeited but the game is still running", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        status: GameStatus.Running,
        gameModeKey: GameModeKey.Duel,
        participants: [
          buildParticipant({ userId: "user-1", score: 10, hasForfeited: true }),
          buildParticipant({
            userId: "user-2",
            username: "opponent",
            score: 4,
          }),
        ],
      })
    );

    expect(screen.getByText("You forfeited")).toBeVisible();
    expect(
      screen.getByText("Results will show once the game ends for everyone.")
    ).toBeVisible();
    expect(screen.queryByText("You won!")).not.toBeInTheDocument();
    expect(screen.queryByText("Victory")).not.toBeInTheDocument();
  });

  it("shows a waiting message when the player finished early but the game is still running", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderSummary(
      buildGame({
        status: GameStatus.Running,
        gameModeKey: GameModeKey.Duel,
        participants: [
          buildParticipant({
            userId: "user-1",
            score: 10,
            hasFinishedProblems: true,
          }),
          buildParticipant({
            userId: "user-2",
            username: "opponent",
            score: 4,
          }),
        ],
      })
    );

    expect(screen.getByText("You finished")).toBeVisible();
    expect(screen.queryByText("You won!")).not.toBeInTheDocument();
  });

  it("starts a new game when Play again is clicked", async () => {
    const createGame = vi.fn();
    mockedUseCreateGameAndPlay.mockReturnValue({
      createGame,
      isCreating: false,
    });
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    const user = userEvent.setup();

    renderSummary(
      buildGame({
        participants: [buildParticipant({ userId: "user-1" })],
      })
    );

    await user.click(screen.getByRole("button", { name: /Play again/ }));

    expect(createGame).toHaveBeenCalledWith({
      gameModeKey: GameModeKey.SoloRush,
      timeLimitInSeconds: 600,
      trackSelections: [
        { trackKey: "general-purpose", languageIds: ["lang-js"] },
      ],
    });
  });
});
