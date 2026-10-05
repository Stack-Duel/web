import { describe, expect, it, vi } from "vitest";
import { getAdminGames } from "./get-admin-games";
import { http } from "@/shared/lib/http";
import { GameStatus } from "../models/game";

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

describe("getAdminGames", () => {
  it("requests a page of games with the given filters", async () => {
    const page = {
      results: [],
      total: 0,
      page: 1,
      size: 20,
      timestamp: "2026-08-30T00:00:00.000Z",
    };
    mockedHttp.get.mockResolvedValue(page);

    const result = await getAdminGames({
      page: 1,
      size: 20,
      timestamp: "2026-08-30T00:00:00.000Z",
      status: GameStatus.Completed,
    });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/game/admin",
      expect.objectContaining({
        params: {
          page: 1,
          size: 20,
          timestamp: "2026-08-30T00:00:00.000Z",
          status: GameStatus.Completed,
        },
      })
    );
    expect(result).toBe(page);
  });
});
