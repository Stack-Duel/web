import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRampSubmission } from "./use-ramp-submission";
import { useSubmitGameProblem } from "../api/submit-game-problem";
import { useCompleteProblem } from "../api/complete-problem";
import { useGameSessionStore } from "../state/game-session-store";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import { waitForTerminalSubmission } from "@/domains/submission/api/wait-for-terminal-submission";
import { GameModeKey } from "../models/game-mode";
import { GameStatus } from "../models/game";
import type { Game } from "../models/game";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("../api/submit-game-problem", () => ({
  useSubmitGameProblem: vi.fn(),
}));
vi.mock("../api/complete-problem", () => ({ useCompleteProblem: vi.fn() }));
vi.mock("@/domains/submission/api/wait-for-terminal-submission", () => ({
  waitForTerminalSubmission: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const mockedUseSubmitGameProblem = vi.mocked(useSubmitGameProblem);
const mockedUseCompleteProblem = vi.mocked(useCompleteProblem);
const mockedWaitForTerminalSubmission = vi.mocked(waitForTerminalSubmission);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    queryClient,
    Wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
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

describe("useRampSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameSessionStore.getState().reset();
    useWorkspaceStore.getState().reset();
    useWorkspaceStore.getState().setCode("print(1)");
  });

  it("submits the current code and stores the resulting submission id", async () => {
    const submitGameProblem = vi.fn().mockResolvedValue("submission-1");
    mockedUseSubmitGameProblem.mockReturnValue({
      mutateAsync: submitGameProblem,
    } as never);
    mockedUseCompleteProblem.mockReturnValue({
      mutateAsync: vi.fn(),
    } as never);
    mockedWaitForTerminalSubmission.mockResolvedValue({
      status: "WrongAnswer",
    } as never);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useRampSubmission(), {
      wrapper: Wrapper,
    });

    await result.current.submit({
      game: buildGame(),
      problemId: "problem-1",
      problemSetupId: "setup-1",
    });

    expect(submitGameProblem).toHaveBeenCalledWith({
      gameId: "game-1",
      problemId: "problem-1",
      body: { problemSetupId: "setup-1", code: "print(1)" },
    });
    expect(useWorkspaceStore.getState().activeSubmissionId).toBe(
      "submission-1"
    );
  });

  it("completes the problem and marks it solved once the submission is accepted", async () => {
    mockedUseSubmitGameProblem.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue("submission-1"),
    } as never);
    const completeProblem = vi
      .fn()
      .mockResolvedValue({ newScore: 10, nextProblemId: "problem-2" });
    mockedUseCompleteProblem.mockReturnValue({
      mutateAsync: completeProblem,
    } as never);
    mockedWaitForTerminalSubmission.mockResolvedValue({
      status: "Accepted",
    } as never);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useRampSubmission(), {
      wrapper: Wrapper,
    });

    await result.current.submit({
      game: buildGame(),
      problemId: "problem-1",
      problemSetupId: "setup-1",
    });

    expect(completeProblem).toHaveBeenCalledWith({
      gameId: "game-1",
      problemId: "problem-1",
      body: { submissionId: "submission-1" },
    });
    expect(useGameSessionStore.getState().pendingNextProblemId).toBe(
      "problem-2"
    );
  });

  it("does not complete the problem when the submission is not accepted", async () => {
    mockedUseSubmitGameProblem.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue("submission-1"),
    } as never);
    const completeProblem = vi.fn();
    mockedUseCompleteProblem.mockReturnValue({
      mutateAsync: completeProblem,
    } as never);
    mockedWaitForTerminalSubmission.mockResolvedValue({
      status: "WrongAnswer",
    } as never);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useRampSubmission(), {
      wrapper: Wrapper,
    });

    await result.current.submit({
      game: buildGame(),
      problemId: "problem-1",
      problemSetupId: "setup-1",
    });

    expect(completeProblem).not.toHaveBeenCalled();
    expect(useGameSessionStore.getState().pendingNextProblemId).toBeUndefined();
  });

  it("toasts an error and stops submitting when the submit call throws", async () => {
    mockedUseSubmitGameProblem.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error("network down")),
    } as never);
    mockedUseCompleteProblem.mockReturnValue({
      mutateAsync: vi.fn(),
    } as never);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useRampSubmission(), {
      wrapper: Wrapper,
    });

    await result.current.submit({
      game: buildGame(),
      problemId: "problem-1",
      problemSetupId: "setup-1",
    });

    expect(toast.error).toHaveBeenCalledWith("network down");
    await waitFor(() =>
      expect(useWorkspaceStore.getState().isSubmittingSubmission).toBe(false)
    );
  });

  it("focuses the Submission tab as soon as the submission starts, before the request resolves", () => {
    let resolveSubmit: (value: string) => void = () => {};
    mockedUseSubmitGameProblem.mockReturnValue({
      mutateAsync: vi.fn(
        () => new Promise<string>((resolve) => (resolveSubmit = resolve))
      ),
    } as never);
    mockedUseCompleteProblem.mockReturnValue({
      mutateAsync: vi.fn(),
    } as never);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useRampSubmission(), {
      wrapper: Wrapper,
    });

    void result.current.submit({
      game: buildGame(),
      problemId: "problem-1",
      problemSetupId: "setup-1",
    });

    expect(useWorkspaceStore.getState().activeTabByNode).toMatchObject({
      root: 3,
      execution: 1,
    });

    resolveSubmit("submission-1");
  });

  it("still focuses the Submission tab even when the submit request fails", async () => {
    mockedUseSubmitGameProblem.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error("network down")),
    } as never);
    mockedUseCompleteProblem.mockReturnValue({
      mutateAsync: vi.fn(),
    } as never);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useRampSubmission(), {
      wrapper: Wrapper,
    });

    await result.current.submit({
      game: buildGame(),
      problemId: "problem-1",
      problemSetupId: "setup-1",
    });

    expect(useWorkspaceStore.getState().activeTabByNode).toMatchObject({
      root: 3,
      execution: 1,
    });
  });
});
