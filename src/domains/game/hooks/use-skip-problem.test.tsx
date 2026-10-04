import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSkipProblem } from "./use-skip-problem";

const mutateAsync = vi.fn();
const loadNextProblem = vi.fn();

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("../api/skip-problem", () => ({
  useSkipProblem: () => ({ mutateAsync, isPending: false }),
}));
vi.mock("./use-load-next-problem", () => ({
  useLoadNextProblem: () => loadNextProblem,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

function createWrapper(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe("useSkipProblem", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("skips the problem, invalidates the game queries, and loads the next problem", async () => {
    mutateAsync.mockResolvedValue({
      skipsRemaining: 2,
      nextProblemId: "problem-2",
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSkipProblem(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.skip({ gameId: "game-1", problemId: "problem-1" });

    expect(mutateAsync).toHaveBeenCalledWith({
      gameId: "game-1",
      problemId: "problem-1",
    });
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["game", "game-1"] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["game-problem-history", "game-1"],
        })
      );
    });
    expect(loadNextProblem).toHaveBeenCalledWith("problem-2");
  });

  it("toasts an error when the skip request fails", async () => {
    mutateAsync.mockRejectedValue(new Error("no skips left"));

    const { result } = renderHook(() => useSkipProblem(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.skip({ gameId: "game-1", problemId: "problem-1" });

    expect(toast.error).toHaveBeenCalledWith("no skips left");
    expect(loadNextProblem).not.toHaveBeenCalled();
  });
});
