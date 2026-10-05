import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RampWorkspaceHeader from "./ramp-workspace-header";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { useProblemSetupStore } from "@/domains/problem/state/problem-setup-store";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import { useGameSessionStore } from "../../state/game-session-store";
import { useProblemSetupSync } from "@/domains/problem/hooks/use-problem-setup-sync";
import { useRampSubmission } from "../../hooks/use-ramp-submission";
import { useLoadNextProblem } from "../../hooks/use-load-next-problem";
import { useSubmitSolution } from "@/domains/workspace/hooks/use-submit-solution";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { GameModeKey } from "../../models/game-mode";
import { GameStatus } from "../../models/game";
import type { Game, GameParticipant } from "../../models/game";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/game/components/forfeit-button", () => ({
  default: () => <div>Forfeit button</div>,
}));
vi.mock("@/domains/game/components/game-score-header", () => ({
  default: () => <div>Game score header</div>,
}));
vi.mock("@/domains/game/hooks/use-game-time-expired", () => ({
  useGameTimeExpired: () => vi.fn(),
}));
vi.mock(
  "@/domains/workspace/language-select/components/language-select",
  () => ({
    LanguageSelect: () => <div>Language select</div>,
  })
);
vi.mock("@/shared/theme/mode-toggle", () => ({
  ModeToggle: () => <div>Mode toggle</div>,
}));
vi.mock("@/domains/problem/hooks/use-problem-setup-sync", () => ({
  useProblemSetupSync: vi.fn(),
}));
vi.mock("../../hooks/use-ramp-submission", () => ({
  useRampSubmission: vi.fn(),
}));
vi.mock("../../hooks/use-load-next-problem", () => ({
  useLoadNextProblem: vi.fn(),
}));
vi.mock("@/domains/workspace/hooks/use-submit-solution", () => ({
  useSubmitSolution: vi.fn(),
}));

const mockedUseProblemSetupSync = vi.mocked(useProblemSetupSync);
const mockedUseRampSubmission = vi.mocked(useRampSubmission);
const mockedUseLoadNextProblem = vi.mocked(useLoadNextProblem);
const mockedUseSubmitSolution = vi.mocked(useSubmitSolution);

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

function renderHeader(game = buildGame()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RampWorkspaceHeader game={game} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

describe("RampWorkspaceHeader", () => {
  beforeEach(() => {
    resetUserStore();
    useProblemSetupStore.getState().clearProblem();
    useWorkspaceStore.getState().reset();
    useGameSessionStore.getState().reset();
    mockedUseProblemSetupSync.mockReturnValue({
      setup: { id: "setup-1", initialCode: "" } as never,
      isLoading: false,
      error: null,
    });
    mockedUseRampSubmission.mockReturnValue({
      submit: vi.fn(),
      isSubmitting: false,
    });
    mockedUseLoadNextProblem.mockReturnValue(vi.fn());
    mockedUseSubmitSolution.mockReturnValue({
      runCode: vi.fn(),
      isRunning: false,
    } as never);
  });

  it("disables Run and Submit while there is no problem setup yet", () => {
    mockedUseProblemSetupSync.mockReturnValue({
      setup: null,
      isLoading: true,
      error: null,
    });

    renderHeader();

    expect(screen.getByRole("button", { name: "Run" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("submits the current problem when Submit is clicked", async () => {
    useProblemSetupStore
      .getState()
      .initializeProblem({ id: "problem-1" } as never);
    const submit = vi.fn();
    mockedUseRampSubmission.mockReturnValue({ submit, isSubmitting: false });
    const user = userEvent.setup();

    renderHeader();
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(submit).toHaveBeenCalledWith({
      game: expect.objectContaining({ gameId: "game-1" }),
      problemId: "problem-1",
      problemSetupId: "setup-1",
    });
  });

  it("runs the current code when Run is clicked", async () => {
    const runCode = vi.fn();
    mockedUseSubmitSolution.mockReturnValue({
      runCode,
      isRunning: false,
    } as never);
    const user = userEvent.setup();

    renderHeader();
    await user.click(screen.getByRole("button", { name: "Run" }));

    expect(runCode).toHaveBeenCalledTimes(1);
  });

  it("shows Next Problem instead of Run/Submit once a problem is solved", async () => {
    useGameSessionStore.getState().problemSolved("problem-2");
    const loadNextProblem = vi.fn();
    mockedUseLoadNextProblem.mockReturnValue(loadNextProblem);
    const user = userEvent.setup();

    renderHeader();

    expect(
      screen.queryByRole("button", { name: "Submit" })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Next Problem/ }));

    expect(loadNextProblem).toHaveBeenCalledWith("problem-2");
  });

  it("submits via Ctrl+Enter when submission is allowed", async () => {
    useProblemSetupStore
      .getState()
      .initializeProblem({ id: "problem-1" } as never);
    const submit = vi.fn();
    mockedUseRampSubmission.mockReturnValue({ submit, isSubmitting: false });
    const user = userEvent.setup();

    renderHeader();
    await user.keyboard("{Control>}{Enter}{/Control}");

    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("shows your score badge next to the buttons and just the timer centered for Solo Rush", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderHeader(
      buildGame({
        gameModeKey: GameModeKey.SoloRush,
        participants: [buildParticipant({ userId: "user-1", score: 6 })],
      })
    );

    expect(screen.getByText("6")).toBeVisible();
    expect(screen.queryByText("Game score header")).not.toBeInTheDocument();
  });

  it("shows the game score header (not a score badge) for multiplayer modes", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    renderHeader(
      buildGame({
        gameModeKey: GameModeKey.Duel,
        participants: [
          buildParticipant({ userId: "user-1", score: 3 }),
          buildParticipant({ userId: "user-2", score: 7 }),
        ],
      })
    );

    expect(screen.getByText("Game score header")).toBeVisible();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });
});
