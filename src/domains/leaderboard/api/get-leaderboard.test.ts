import { describe, expect, it, vi } from "vitest";
import { getLeaderboard } from "./get-leaderboard";
import { http } from "@/shared/lib/http";
import { GameModeKey } from "@/domains/game/models/game-mode";

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

describe("getLeaderboard", () => {
  it("gets the leaderboard for a game mode, time limit, and page", async () => {
    mockedHttp.get.mockResolvedValue({
      results: [],
      total: 0,
      page: 1,
      size: 25,
      timestamp: "2026-01-01T00:00:00.000Z",
    });

    await getLeaderboard({
      gameModeKey: GameModeKey.SoloRush,
      timeLimitInSeconds: 180,
      page: 1,
      size: 25,
    });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/leaderboard", {
      headers: undefined,
      signal: undefined,
      params: {
        gameModeKey: GameModeKey.SoloRush,
        timeLimitInSeconds: 180,
        page: 1,
        size: 25,
      },
    });
  });
});
