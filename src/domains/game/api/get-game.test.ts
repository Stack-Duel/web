import { describe, expect, it, vi } from "vitest";
import { getGame } from "./get-game";
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

describe("getGame", () => {
  it("gets the game by id", async () => {
    const game = { gameId: "game-1" };
    mockedHttp.get.mockResolvedValue(game);

    const result = await getGame({ gameId: "game-1" });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/game/game-1", {
      headers: undefined,
      signal: undefined,
    });
    expect(result).toEqual(game);
  });
});
