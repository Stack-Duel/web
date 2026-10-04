import { describe, expect, it, vi } from "vitest";
import { getAdminGamePlayerHistory } from "./get-admin-game-player-history";
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

describe("getAdminGamePlayerHistory", () => {
  it("requests the game's player history by id", async () => {
    const history = [{ userId: "u1", events: [] }];
    mockedHttp.get.mockResolvedValue(history);

    const result = await getAdminGamePlayerHistory({ gameId: "game_1" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/game/admin/game_1/history",
      expect.anything()
    );
    expect(result).toBe(history);
  });
});
