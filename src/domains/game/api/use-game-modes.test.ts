import { describe, expect, it, vi } from "vitest";
import { getGameModes } from "./use-game-modes";
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

describe("getGameModes", () => {
  it("gets the available game modes", async () => {
    mockedHttp.get.mockResolvedValue([]);

    const result = await getGameModes({});

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/game/modes", {
      headers: undefined,
      signal: undefined,
    });
    expect(result).toEqual([]);
  });
});
