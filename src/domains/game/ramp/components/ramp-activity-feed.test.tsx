import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RampActivityFeed from "./ramp-activity-feed";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { useGameSessionStore } from "../../state/game-session-store";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { GameModeKey } from "../../models/game-mode";
import { GameStatus } from "../../models/game";
import type { Game, GameParticipant } from "../../models/game";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/shared/lib/signalr/game-hub-client", () => ({
  sendGameReaction: vi.fn().mockResolvedValue(undefined),
}));

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

function renderFeed(game: Game) {
  return render(
    <TooltipProvider>
      <RampActivityFeed game={game} />
    </TooltipProvider>
  );
}

describe("RampActivityFeed", () => {
  beforeEach(() => {
    resetUserStore();
  });

  afterEach(() => {
    useGameSessionStore.setState({ feed: [] });
  });

  it("shows an empty state when nothing has happened yet", () => {
    renderFeed(
      buildGame({
        participants: [buildParticipant({ userId: "user-1", username: "me" })],
      })
    );

    expect(screen.getByText("No activity yet.")).toBeVisible();
  });

  it("shows the attempting participant's username and verdict", () => {
    useGameSessionStore.setState({
      feed: [
        {
          id: "1",
          type: "attempt",
          userId: "user-2",
          status: "WrongAnswer",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    renderFeed(
      buildGame({
        participants: [
          buildParticipant({ userId: "user-1", username: "me" }),
          buildParticipant({ userId: "user-2", username: "opponent" }),
        ],
      })
    );

    expect(screen.getByText("opponent")).toBeVisible();
    expect(screen.getByText("Wrong Answer")).toBeVisible();
  });

  it("shows a reaction entry as just the emoji", () => {
    useGameSessionStore.setState({
      feed: [
        {
          id: "1",
          type: "reaction",
          userId: "user-2",
          emoji: "🔥",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    renderFeed(
      buildGame({
        participants: [
          buildParticipant({ userId: "user-2", username: "opponent" }),
        ],
      })
    );

    expect(screen.getByText("🔥", { selector: "span" })).toBeVisible();
  });

  it("aligns the current user's own entries to the end", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    useGameSessionStore.setState({
      feed: [
        {
          id: "1",
          type: "reaction",
          userId: "user-1",
          emoji: "👍",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    renderFeed(
      buildGame({
        participants: [buildParticipant({ userId: "user-1", username: "me" })],
      })
    );

    const bubble = screen
      .getByText("👍", { selector: "span" })
      .closest("[data-slot='bubble']");
    expect(bubble).toHaveAttribute("data-align", "end");
  });

  it("aligns other participants' entries to the start", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    useGameSessionStore.setState({
      feed: [
        {
          id: "1",
          type: "reaction",
          userId: "user-2",
          emoji: "👍",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    renderFeed(
      buildGame({
        participants: [
          buildParticipant({ userId: "user-2", username: "opponent" }),
        ],
      })
    );

    const bubble = screen
      .getByText("👍", { selector: "span" })
      .closest("[data-slot='bubble']");
    expect(bubble).toHaveAttribute("data-align", "start");
  });

  it("renders the quick-reactions bar", () => {
    renderFeed(
      buildGame({
        participants: [buildParticipant({ userId: "user-1", username: "me" })],
      })
    );

    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });
});
