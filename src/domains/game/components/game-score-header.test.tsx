import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GameScoreHeader from "./game-score-header";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { Game, GameParticipant } from "../models/game";

vi.mock("@/env", () => import("@/test/mocks/env"));

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
    startedAt: new Date(),
    participants: [],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe("GameScoreHeader", () => {
  beforeEach(() => {
    resetUserStore();
  });

  it("renders nothing when the current user isn't a participant", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    const { container } = render(
      <GameScoreHeader
        game={buildGame({
          participants: [buildParticipant({ userId: "user-2" })],
        })}
      />,
      { wrapper: createWrapper() }
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for Solo Rush, since there's no one to show a rival against", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    const { container } = render(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.SoloRush,
          participants: [
            buildParticipant({ userId: "user-1", username: "me", score: 5 }),
          ],
        })}
      />,
      { wrapper: createWrapper() }
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows both players' names and scores for a Duel", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.Duel,
          participants: [
            buildParticipant({ userId: "user-1", username: "me", score: 3 }),
            buildParticipant({
              userId: "user-2",
              username: "opponent",
              score: 7,
            }),
          ],
        })}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("me")).toBeVisible();
    expect(screen.getByText("3")).toBeVisible();
    expect(screen.getByText("opponent")).toBeVisible();
    expect(screen.getByText("7")).toBeVisible();
    expect(screen.queryByText("1st")).not.toBeInTheDocument();
  });

  it("colors whoever is currently leading green and the trailing player red, regardless of self/opponent", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.Duel,
          participants: [
            buildParticipant({ userId: "user-1", username: "me", score: 3 }),
            buildParticipant({
              userId: "user-2",
              username: "opponent",
              score: 7,
            }),
          ],
        })}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("3")).toHaveClass("text-rose-500");
    expect(screen.getByText("7")).toHaveClass("text-emerald-500");
  });

  it("swaps the leader highlight to the current player once they pull ahead", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.Duel,
          participants: [
            buildParticipant({ userId: "user-1", username: "me", score: 8 }),
            buildParticipant({
              userId: "user-2",
              username: "opponent",
              score: 5,
            }),
          ],
        })}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("8")).toHaveClass("text-emerald-500");
    expect(screen.getByText("5")).toHaveClass("text-rose-500");
  });

  it("keeps both players neutral when tied", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.Duel,
          participants: [
            buildParticipant({ userId: "user-1", username: "me", score: 4 }),
            buildParticipant({
              userId: "user-2",
              username: "opponent",
              score: 4,
            }),
          ],
        })}
      />,
      { wrapper: createWrapper() }
    );

    const scores = screen.getAllByText("4");
    expect(scores[0]).toHaveClass("text-foreground");
    expect(scores[1]).toHaveClass("text-foreground");
    for (const score of scores) {
      expect(score).not.toHaveClass("text-emerald-500");
      expect(score).not.toHaveClass("text-rose-500");
    }
  });

  it("shows a crown next to the leading player only", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.Duel,
          participants: [
            buildParticipant({ userId: "user-1", username: "me", score: 3 }),
            buildParticipant({
              userId: "user-2",
              username: "opponent",
              score: 7,
            }),
          ],
        })}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getAllByLabelText("Leading")).toHaveLength(1);
  });

  it("pops a +1 next to a player's score when it increases", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    const { rerender } = render(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.Duel,
          participants: [
            buildParticipant({ userId: "user-1", username: "me", score: 3 }),
            buildParticipant({
              userId: "user-2",
              username: "opponent",
              score: 7,
            }),
          ],
        })}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText("+1")).not.toBeInTheDocument();

    rerender(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.Duel,
          participants: [
            buildParticipant({ userId: "user-1", username: "me", score: 4 }),
            buildParticipant({
              userId: "user-2",
              username: "opponent",
              score: 7,
            }),
          ],
        })}
      />
    );

    expect(screen.getByText("+1")).toBeVisible();
  });

  it("marks a forfeited rival's status", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.Duel,
          participants: [
            buildParticipant({ userId: "user-1", username: "me" }),
            buildParticipant({
              userId: "user-2",
              username: "opponent",
              hasForfeited: true,
            }),
          ],
        })}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("opponent (forfeited)")).toBeVisible();
  });

  it("shows the leader plus your own place for FFA when you're behind", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.Ffa,
          participants: [
            buildParticipant({ userId: "user-1", username: "me", score: 4 }),
            buildParticipant({
              userId: "user-2",
              username: "leader",
              score: 9,
            }),
            buildParticipant({
              userId: "user-3",
              username: "third",
              score: 2,
            }),
          ],
        })}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("me")).toBeVisible();
    expect(screen.getByText("4")).toBeVisible();
    expect(screen.getByText("leader")).toBeVisible();
    expect(screen.getByText("9")).toBeVisible();
    expect(screen.queryByText("third")).not.toBeInTheDocument();
    expect(screen.getByText("#2")).toBeVisible();
    expect(screen.getByText("1st")).toBeVisible();
  });

  it("shows the next-highest player when you're already in first for FFA", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <GameScoreHeader
        game={buildGame({
          gameModeKey: GameModeKey.Ffa,
          participants: [
            buildParticipant({ userId: "user-1", username: "me", score: 9 }),
            buildParticipant({
              userId: "user-2",
              username: "runner_up",
              score: 6,
            }),
            buildParticipant({
              userId: "user-3",
              username: "third",
              score: 2,
            }),
          ],
        })}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("me")).toBeVisible();
    expect(screen.getByText("9")).toBeVisible();
    expect(screen.getByText("runner_up")).toBeVisible();
    expect(screen.getByText("6")).toBeVisible();
    expect(screen.queryByText("third")).not.toBeInTheDocument();
    expect(screen.getByText("#1")).toBeVisible();
    expect(screen.getByText("2nd")).toBeVisible();
  });
});
