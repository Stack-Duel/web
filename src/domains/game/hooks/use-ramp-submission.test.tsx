import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRampSubmission } from "./use-ramp-submission";
import { useSubmitGameProblem } from "../api/submit-game-problem";
import { useGameSessionStore } from "../state/game-session-store";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import { useUserStore } from "@/domains/user/state/user-store";
import { waitForTerminalSubmission } from "@/domains/submission/api/wait-for-terminal-submission";
import { buildGame, buildParticipant } from "@/test/factories/game";
import type { GameParticipant } from "../models/game";
import type { SubmissionStatus } from "@/domains/submission/models/submission-status";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("../api/submit-game-problem", () => ({
  useSubmitGameProblem: vi.fn(),
}));
vi.mock("@/domains/submission/api/wait-for-terminal-submission", () => ({
  waitForTerminalSubmission: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const mockedUseSubmitGameProblem = vi.mocked(useSubmitGameProblem);
const mockedWaitForTerminalSubmission = vi.mocked(waitForTerminalSubmission);

function createWrapper(queryClient: QueryClient) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
}

interface SetupOptions {
  /** Defaults to a mutation that resolves with "submission-1". */
  submitGameProblem?: ReturnType<typeof vi.fn>;
  /** Terminal status reported for the submission, when the test gets that far. */
  terminalStatus?: SubmissionStatus;
  /** Own participant on the game the hook refetches after an accepted submission.
   *  Omit to leave the cache empty and let `fetchQuery` run untouched. */
  refreshedParticipant?: Partial<GameParticipant>;
}

function setupRampSubmission(options: SetupOptions = {}) {
  const submitGameProblem =
    options.submitGameProblem ?? vi.fn().mockResolvedValue("submission-1");
  mockedUseSubmitGameProblem.mockReturnValue({
    mutateAsync: submitGameProblem,
  } as never);

  if (options.terminalStatus) {
    mockedWaitForTerminalSubmission.mockResolvedValue({
      status: options.terminalStatus,
    } as never);
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const fetchQuerySpy = vi.spyOn(queryClient, "fetchQuery");

  if ("refreshedParticipant" in options) {
    queryClient.setQueryData(["game", "game-1"], buildGame());
    fetchQuerySpy.mockResolvedValue(
      buildGame({
        participants: [
          buildParticipant({ score: 10, ...options.refreshedParticipant }),
        ],
      }) as never
    );
  }

  const { result } = renderHook(() => useRampSubmission(), {
    wrapper: createWrapper(queryClient),
  });

  const submit = () =>
    result.current.submit({
      game: buildGame(),
      problemId: "problem-1",
      problemSetupId: "setup-1",
    });

  return { submitGameProblem, fetchQuerySpy, submit };
}

describe("useRampSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameSessionStore.getState().reset();
    useWorkspaceStore.getState().reset();
    useWorkspaceStore.getState().setCode("print(1)");
    useUserStore.setState({ user: { id: "user-1" } as never });
  });

  it("submits the current code and stores the resulting submission id", async () => {
    const { submitGameProblem, submit } = setupRampSubmission({
      terminalStatus: "WrongAnswer",
    });

    await submit();

    expect(submitGameProblem).toHaveBeenCalledWith({
      gameId: "game-1",
      problemId: "problem-1",
      body: { problemSetupId: "setup-1", code: "print(1)" },
    });
    expect(useWorkspaceStore.getState().activeSubmissionId).toBe(
      "submission-1"
    );
  });

  it("marks the problem solved from the refreshed game once the submission is accepted", async () => {
    const { fetchQuerySpy, submit } = setupRampSubmission({
      terminalStatus: "Accepted",
      refreshedParticipant: { currentProblem: { problemId: "problem-2" } },
    });

    await submit();

    expect(fetchQuerySpy).toHaveBeenCalled();
    expect(useGameSessionStore.getState().hasSolvedCurrentProblem).toBe(true);
    expect(useGameSessionStore.getState().nextProblemId).toBe("problem-2");
  });

  it("does not mark the problem solved when the submission is not accepted", async () => {
    const { fetchQuerySpy, submit } = setupRampSubmission({
      terminalStatus: "WrongAnswer",
    });

    await submit();

    expect(fetchQuerySpy).not.toHaveBeenCalled();
    expect(useGameSessionStore.getState().hasSolvedCurrentProblem).toBe(false);
  });

  it("does not advance or report game over while the refetched game still shows the same current problem", async () => {
    const { submit } = setupRampSubmission({
      terminalStatus: "Accepted",
      refreshedParticipant: { currentProblem: { problemId: "problem-1" } },
    });

    await submit();

    expect(useGameSessionStore.getState().hasSolvedCurrentProblem).toBe(false);
    expect(useGameSessionStore.getState().nextProblemId).toBeNull();
  });

  it("reports game over with a null next problem when the participant has finished all problems", async () => {
    const { submit } = setupRampSubmission({
      terminalStatus: "Accepted",
      refreshedParticipant: {
        currentProblem: null,
        hasFinishedProblems: true,
      },
    });

    await submit();

    expect(useGameSessionStore.getState().hasSolvedCurrentProblem).toBe(true);
    expect(useGameSessionStore.getState().nextProblemId).toBeNull();
  });

  it("reports game over when the participant has no current problem even though they have not formally finished", async () => {
    const { submit } = setupRampSubmission({
      terminalStatus: "Accepted",
      refreshedParticipant: { currentProblem: null },
    });

    await submit();

    expect(useGameSessionStore.getState().hasSolvedCurrentProblem).toBe(true);
    expect(useGameSessionStore.getState().nextProblemId).toBeNull();
  });

  it("toasts an error and stops submitting when the submit call throws", async () => {
    const { submit } = setupRampSubmission({
      submitGameProblem: vi.fn().mockRejectedValue(new Error("network down")),
    });

    await submit();

    expect(toast.error).toHaveBeenCalledWith("network down");
    await waitFor(() =>
      expect(useWorkspaceStore.getState().isSubmittingSubmission).toBe(false)
    );
    expect(useGameSessionStore.getState().gradingProblemId).toBeNull();
  });

  it("focuses the Submission tab as soon as the submission starts, before the request resolves", () => {
    let resolveSubmit: (value: string) => void = () => {};
    const { submit } = setupRampSubmission({
      submitGameProblem: vi.fn(
        () => new Promise<string>((resolve) => (resolveSubmit = resolve))
      ),
    });

    void submit();

    expect(useWorkspaceStore.getState().activeTabByNode).toMatchObject({
      root: 3,
      execution: 1,
    });
    expect(useGameSessionStore.getState().gradingProblemId).toBe("problem-1");

    resolveSubmit("submission-1");
  });

  it("still focuses the Submission tab even when the submit request fails", async () => {
    const { submit } = setupRampSubmission({
      submitGameProblem: vi.fn().mockRejectedValue(new Error("network down")),
    });

    await submit();

    expect(useWorkspaceStore.getState().activeTabByNode).toMatchObject({
      root: 3,
      execution: 1,
    });
  });
});
