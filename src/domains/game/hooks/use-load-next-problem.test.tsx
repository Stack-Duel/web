import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLoadNextProblem } from "./use-load-next-problem";
import { useGameSessionStore } from "../state/game-session-store";

const initializeProblem = vi.fn();
const problemByIdQueryOptions = vi.fn((params: { id: string }) => ({
  queryKey: ["problem-by-id", params.id],
  queryFn: async () => ({ id: params.id, title: "Next Problem" }),
}));

vi.mock("@/domains/problem/api/get-problem-by-id", () => ({
  problemByIdQueryOptions: (params: { id: string }) =>
    problemByIdQueryOptions(params),
}));
vi.mock("@/domains/problem/hooks/use-problem-actions", () => ({
  useInitializeProblem: () => initializeProblem,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

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

describe("useLoadNextProblem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameSessionStore.getState().reset();
  });

  it("does nothing when there is no next problem id", async () => {
    const { result } = renderHook(() => useLoadNextProblem(), {
      wrapper: createWrapper(),
    });

    await result.current(null);
    await result.current(undefined);

    expect(initializeProblem).not.toHaveBeenCalled();
  });

  it("marks the next problem as loading and initializes it once fetched", async () => {
    useGameSessionStore.getState().problemSolved("problem-2");

    const { result } = renderHook(() => useLoadNextProblem(), {
      wrapper: createWrapper(),
    });

    const loadPromise = result.current("problem-2");

    expect(useGameSessionStore.getState().pendingNextProblemId).toBeUndefined();

    await loadPromise;

    await waitFor(() =>
      expect(initializeProblem).toHaveBeenCalledWith(
        expect.objectContaining({ id: "problem-2" })
      )
    );
  });

  it("toasts an error when the fetch fails", async () => {
    problemByIdQueryOptions.mockReturnValueOnce({
      queryKey: ["problem-by-id", "problem-3"],
      queryFn: async () => {
        throw new Error("network down");
      },
    });

    const { result } = renderHook(() => useLoadNextProblem(), {
      wrapper: createWrapper(),
    });

    await result.current("problem-3");

    expect(toast.error).toHaveBeenCalledWith("network down");
    expect(initializeProblem).not.toHaveBeenCalled();
  });
});
