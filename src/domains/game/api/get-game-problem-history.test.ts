import { describe, expect, it, vi } from "vitest";
import { getGameProblemHistory } from "./get-game-problem-history";
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

describe("getGameProblemHistory", () => {
  it("gets the game's problem history", async () => {
    mockedHttp.get.mockResolvedValue([]);

    const result = await getGameProblemHistory({ gameId: "game-1" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/game/game-1/problems",
      { headers: undefined, signal: undefined }
    );
    expect(result).toEqual([]);
  });
});
