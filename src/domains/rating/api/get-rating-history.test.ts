import { describe, expect, it, vi } from "vitest";
import { getRatingHistory } from "./get-rating-history";
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

describe("getRatingHistory", () => {
  it("gets the current user's rating history for a game mode", async () => {
    mockedHttp.get.mockResolvedValue([]);

    await getRatingHistory({ gameModeKey: GameModeKey.Duel });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/rating/me/history", {
      headers: undefined,
      signal: undefined,
      params: { gameModeKey: GameModeKey.Duel },
    });
  });
});
