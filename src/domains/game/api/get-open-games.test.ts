import { describe, expect, it, vi } from "vitest";
import { getOpenGames } from "./get-open-games";
import { http } from "@/shared/lib/http";
import { GameModeKey } from "../models/game-mode";

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

describe("getOpenGames", () => {
  it("gets open games with pagination and an optional game mode filter", async () => {
    mockedHttp.get.mockResolvedValue({
      results: [],
      total: 0,
      page: 0,
      size: 10,
      timestamp: "2026-01-01T00:00:00.000Z",
    });

    await getOpenGames({ gameModeKey: GameModeKey.Duel, page: 0, size: 10 });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/game", {
      headers: undefined,
      signal: undefined,
      params: { gameModeKey: GameModeKey.Duel, page: 0, size: 10 },
    });
  });

  it("omits the game mode filter when not provided", async () => {
    mockedHttp.get.mockResolvedValue({
      results: [],
      total: 0,
      page: 0,
      size: 10,
      timestamp: "2026-01-01T00:00:00.000Z",
    });

    await getOpenGames({ page: 1, size: 20 });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/game", {
      headers: undefined,
      signal: undefined,
      params: { gameModeKey: undefined, page: 1, size: 20 },
    });
  });
});
