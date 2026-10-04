import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RampProblemHistory from "./ramp-problem-history";

vi.mock("@/domains/problem/api/get-problem-by-id", () => ({
  problemByIdQueryOptions: (params: { id: string }) => ({
    queryKey: ["problem-by-id", params.id],
    queryFn: async () => ({ id: params.id, title: `Problem ${params.id}` }),
  }),
}));

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

describe("RampProblemHistory", () => {
  it("shows a message when nothing has been solved yet", () => {
    render(
      <RampProblemHistory
        solvedProblemIds={[]}
        currentProblemId="problem-1"
        viewingProblemId={null}
        onSelectProblem={vi.fn()}
        onReturnToCurrent={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("No problems solved yet.")).toBeVisible();
  });

  it("shows the current problem entry and calls onReturnToCurrent when clicked", async () => {
    const onReturnToCurrent = vi.fn();
    const user = userEvent.setup();

    render(
      <RampProblemHistory
        solvedProblemIds={[]}
        currentProblemId="problem-1"
        viewingProblemId={null}
        onSelectProblem={vi.fn()}
        onReturnToCurrent={onReturnToCurrent}
      />,
      { wrapper: createWrapper() }
    );

    await user.click(screen.getByText("Current problem"));

    expect(onReturnToCurrent).toHaveBeenCalledTimes(1);
  });

  it("lists solved problems with their titles once loaded, and selects one on click", async () => {
    const onSelectProblem = vi.fn();
    const user = userEvent.setup();

    render(
      <RampProblemHistory
        solvedProblemIds={["problem-2"]}
        currentProblemId="problem-1"
        viewingProblemId={null}
        onSelectProblem={onSelectProblem}
        onReturnToCurrent={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    const entry = await screen.findByText("Problem problem-2");
    await user.click(entry);

    expect(onSelectProblem).toHaveBeenCalledWith("problem-2");
  });

  it("does not show the current-problem entry once every problem is solved", () => {
    render(
      <RampProblemHistory
        solvedProblemIds={["problem-2"]}
        currentProblemId={null}
        viewingProblemId={null}
        onSelectProblem={vi.fn()}
        onReturnToCurrent={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText("Current problem")).not.toBeInTheDocument();
  });
});
