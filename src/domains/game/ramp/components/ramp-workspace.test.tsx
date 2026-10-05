import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RampWorkspace from "./ramp-workspace";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useProblemSetupStore } from "@/domains/problem/state/problem-setup-store";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import { useGameSessionStore } from "../../state/game-session-store";
import { useGameProblemHistory } from "../../api/get-game-problem-history";
import { GameModeKey } from "../../models/game-mode";
import { GameStatus } from "../../models/game";
import type { Game } from "../../models/game";

vi.mock("@/shared/hooks/use-mobile", () => ({ useIsMobile: vi.fn() }));
vi.mock(
  "@/domains/workspace/editor-window/editor",
  () => import("@/test/mocks/game-editor-window")
);
vi.mock(
  "@/domains/workspace/solution-editor/components/solution-editor",
  () => import("@/test/mocks/game-solution-editor")
);
vi.mock("@/domains/problem/components/problem-question", () => ({
  ProblemQuestion: ({ problem }: { problem: { title: string } }) => (
    <div>Question: {problem.title}</div>
  ),
}));
vi.mock("@/domains/problem/components/problem-test-cases", () => ({
  default: () => <div>Test cases</div>,
}));
vi.mock("@/domains/submission/components/submission-status-panel", () => ({
  default: () => <div>Submission status panel</div>,
}));
vi.mock("@/domains/submission/api/get-submission-status", () => ({
  useSubmissionStatus: vi.fn(() => ({ data: undefined })),
}));
vi.mock("@/domains/problem/api/get-problem-by-id", () => ({
  useProblemById: vi.fn(() => ({ data: undefined })),
}));
vi.mock("../../api/get-game-problem-history", () => ({
  useGameProblemHistory: vi.fn(),
}));
vi.mock("./ramp-problem-history", () => ({
  default: () => <div>Problem history</div>,
}));
vi.mock("./ramp-standings", () => ({ default: () => <div>Standings</div> }));
vi.mock("./ramp-activity-feed", () => ({
  default: () => <div>Activity feed</div>,
}));

const mockedUseIsMobile = vi.mocked(useIsMobile);
const mockedUseGameProblemHistory = vi.mocked(useGameProblemHistory);

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

describe("RampWorkspace", () => {
  beforeEach(() => {
    useProblemSetupStore.getState().clearProblem();
    useWorkspaceStore.getState().reset();
    useGameSessionStore.getState().reset();
    mockedUseIsMobile.mockReturnValue(false);
    mockedUseGameProblemHistory.mockReturnValue({ data: [] } as never);
  });

  it("shows a loading placeholder before the current problem is known", () => {
    render(<RampWorkspace game={buildGame()} />);

    expect(screen.getByText("Loading problem...")).toBeVisible();
  });

  it("shows the problem description once loaded", () => {
    useProblemSetupStore
      .getState()
      .initializeProblem({ id: "problem-1", title: "Two Sum" } as never);

    render(<RampWorkspace game={buildGame()} />);

    expect(screen.getByText("Question: Two Sum")).toBeVisible();
  });

  it("includes the score tab for multiplayer games", () => {
    render(
      <RampWorkspace
        game={buildGame({
          gameModeKey: GameModeKey.Duel,
          participants: [
            { userId: "user-1" } as never,
            { userId: "user-2" } as never,
          ],
        })}
      />
    );

    expect(screen.getByText("Standings")).toBeVisible();
  });

  it("omits the score tab for solo rush games", () => {
    render(
      <RampWorkspace
        game={buildGame({ participants: [{ userId: "user-1" } as never] })}
      />
    );

    expect(screen.queryByText("Standings")).not.toBeInTheDocument();
  });

  // The mocked EditorWindow (see @/test/mocks/game-editor-window) flattens and renders every
  // leaf's component regardless of where it sits in the tree, so these two only verify the
  // multiplayer/solo-rush gating, not that Activity is a top-level pane rather than a tab nested
  // in another group (that structural change was verified by inspecting the real, unmocked
  // EditorWindowTab's output, which only ever mounts a group's *active* tab).
  it("includes the activity pane for multiplayer games", () => {
    render(
      <RampWorkspace
        game={buildGame({
          gameModeKey: GameModeKey.Duel,
          participants: [
            { userId: "user-1" } as never,
            { userId: "user-2" } as never,
          ],
        })}
      />
    );

    expect(screen.getByText("Activity feed")).toBeVisible();
  });

  it("omits the activity pane for solo rush games", () => {
    render(
      <RampWorkspace
        game={buildGame({ participants: [{ userId: "user-1" } as never] })}
      />
    );

    expect(screen.queryByText("Activity feed")).not.toBeInTheDocument();
  });

  it("shows a viewing-history banner and returns to the current problem", async () => {
    useGameSessionStore.getState().viewProblem("problem-2");
    const user = userEvent.setup();

    render(<RampWorkspace game={buildGame()} />);

    expect(screen.getByText(/solved, read-only/)).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: /Back to current problem/ })
    );

    expect(useGameSessionStore.getState().viewingProblemId).toBeNull();
  });

  it("does not show the history banner while viewing the live problem", () => {
    render(<RampWorkspace game={buildGame()} />);

    expect(screen.queryByText(/solved, read-only/)).not.toBeInTheDocument();
  });
});
