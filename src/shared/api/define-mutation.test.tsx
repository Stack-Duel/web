import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineMutation } from "./define-mutation";

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

describe("defineMutation", () => {
  it("calls the mutation function with the variables and an abort signal", async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: "1" });
    const mutation = defineMutation<{ id: string }, { name: string }>({
      mutationFn,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => mutation.useMutation(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ name: "Two Sum" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mutationFn).toHaveBeenCalledWith({
      name: "Two Sum",
      signal: expect.any(AbortSignal),
    });
  });

  it("invalidates the configured queries on success", async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: "1" });
    const mutation = defineMutation<{ id: string }, { name: string }>({
      mutationFn,
      invalidateQueries: () => [["problems"], ["account"]],
    });
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => mutation.useMutation(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ name: "Two Sum" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["problems"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["account"] });
  });

  it("does not invalidate anything when no invalidateQueries is configured", async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: "1" });
    const mutation = defineMutation<{ id: string }, { name: string }>({
      mutationFn,
    });
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => mutation.useMutation(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ name: "Two Sum" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("still calls a custom onSuccess passed via mutationConfig", async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: "1" });
    const onSuccess = vi.fn();
    const mutation = defineMutation<{ id: string }, { name: string }>({
      mutationFn,
      invalidateQueries: () => [["problems"]],
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () => mutation.useMutation({ mutationConfig: { onSuccess } }),
      { wrapper: Wrapper }
    );

    result.current.mutate({ name: "Two Sum" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const [data, variables] = onSuccess.mock.calls[0];
    expect(data).toEqual({ id: "1" });
    expect(variables).toEqual({ name: "Two Sum" });
  });
});
