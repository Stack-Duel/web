import { Suspense } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineQuery } from "./define-query";

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

describe("defineQuery", () => {
  it("builds query options with the resolved query key", () => {
    const query = defineQuery<string, { id: string }>({
      queryKey: ({ id }) => ["item", id],
      queryFn: vi.fn().mockResolvedValue("value"),
    });

    expect(query.queryOptions({ id: "42" }).queryKey).toEqual(["item", "42"]);
  });

  it("useQuery fetches and returns the resolved data", async () => {
    const queryFn = vi.fn().mockResolvedValue({ id: "1", name: "Two Sum" });
    const query = defineQuery<{ id: string; name: string }, { id: string }>({
      queryKey: ({ id }) => ["problem", id],
      queryFn,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => query.useQuery({ id: "1" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: "1", name: "Two Sum" });
    expect(queryFn).toHaveBeenCalledWith({
      id: "1",
      signal: expect.any(AbortSignal),
    });
  });

  it("merges queryConfig overrides, e.g. disabling the query", () => {
    const queryFn = vi.fn().mockResolvedValue("value");
    const query = defineQuery<string, { id: string }>({
      queryKey: ({ id }) => ["item", id],
      queryFn,
    });
    const { Wrapper } = createWrapper();

    renderHook(
      () => query.useQuery({ id: "1", queryConfig: { enabled: false } }),
      { wrapper: Wrapper }
    );

    expect(queryFn).not.toHaveBeenCalled();
  });

  it("useSuspenseQuery suspends until the data resolves", async () => {
    const query = defineQuery<string, { id: string }>({
      queryKey: ({ id }) => ["item", id],
      queryFn: () => Promise.resolve("suspended value"),
    });
    const { queryClient } = createWrapper();

    function TestComponent() {
      const { data } = query.useSuspenseQuery({ id: "1" });
      return <p>{data}</p>;
    }

    render(
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<p>Loading...</p>}>
          <TestComponent />
        </Suspense>
      </QueryClientProvider>
    );

    expect(screen.getByText("Loading...")).toBeVisible();
    expect(await screen.findByText("suspended value")).toBeVisible();
  });
});
