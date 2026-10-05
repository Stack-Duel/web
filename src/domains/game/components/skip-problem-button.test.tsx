import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SkipProblemButton from "./skip-problem-button";
import { useSkipProblem } from "@/domains/game/hooks/use-skip-problem";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { Game, GameParticipant } from "../models/game";

vi.mock("@/domains/game/hooks/use-skip-problem", () => ({
  useSkipProblem: vi.fn(),
}));

const mockedUseSkipProblem = vi.mocked(useSkipProblem);

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
    skipsRemaining: 3,
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
    participants: [buildParticipant()],
    techStacks: [],
    joinCode: "ABC1234",
    skipsEnabled: true,
    ...overrides,
  };
}

describe("SkipProblemButton", () => {
  beforeEach(() => {
    resetUserStore();
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
  });

  it("shows the current user's remaining skip count", () => {
    mockedUseSkipProblem.mockReturnValue({ skip: vi.fn(), isSkipping: false });

    render(
      <SkipProblemButton
        game={buildGame({
          participants: [buildParticipant({ skipsRemaining: 2 })],
        })}
        problemId="problem-1"
      />
    );

    expect(screen.getByRole("button", { name: /skip \(2\)/i })).toBeVisible();
  });

  it("skips the current problem when clicked", async () => {
    const skip = vi.fn();
    mockedUseSkipProblem.mockReturnValue({ skip, isSkipping: false });
    const user = userEvent.setup();

    render(<SkipProblemButton game={buildGame()} problemId="problem-1" />);
    await user.click(screen.getByRole("button", { name: /skip/i }));

    expect(skip).toHaveBeenCalledWith({
      gameId: "game-1",
      problemId: "problem-1",
    });
  });

  it("disables the button when there are no skips remaining", () => {
    mockedUseSkipProblem.mockReturnValue({ skip: vi.fn(), isSkipping: false });

    render(
      <SkipProblemButton
        game={buildGame({
          participants: [buildParticipant({ skipsRemaining: 0 })],
        })}
        problemId="problem-1"
      />
    );

    expect(screen.getByRole("button", { name: /skip \(0\)/i })).toBeDisabled();
  });

  it("renders nothing when skips are disabled for the game", () => {
    mockedUseSkipProblem.mockReturnValue({ skip: vi.fn(), isSkipping: false });

    const { container } = render(
      <SkipProblemButton
        game={buildGame({ skipsEnabled: false })}
        problemId="problem-1"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the current user isn't a participant", () => {
    mockedUseSkipProblem.mockReturnValue({ skip: vi.fn(), isSkipping: false });

    const { container } = render(
      <SkipProblemButton
        game={buildGame({ participants: [] })}
        problemId="problem-1"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
