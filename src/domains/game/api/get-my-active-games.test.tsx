import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getMyActiveGames, useMyActiveGames } from "./get-my-active-games";
import { http } from "@/shared/lib/http";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(http, { deep: true });

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    Wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe("getMyActiveGames", () => {
  it("gets the current user's active games", async () => {
    mockedHttp.get.mockResolvedValue([]);

    const result = await getMyActiveGames({});

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/game/mine", {
      headers: undefined,
      signal: undefined,
    });
    expect(result).toEqual([]);
  });
});

describe("useMyActiveGames", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when disabled", () => {
    mockedHttp.get.mockResolvedValue([]);
    const { Wrapper } = createWrapper();

    renderHook(() => useMyActiveGames(false), { wrapper: Wrapper });

    expect(mockedHttp.get).not.toHaveBeenCalled();
  });

  it("fetches when enabled", async () => {
    mockedHttp.get.mockResolvedValue([]);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useMyActiveGames(true), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/game/mine",
      expect.anything()
    );
  });
});
