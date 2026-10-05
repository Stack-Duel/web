import { describe, expect, it, vi } from "vitest";
import { leaveGame } from "./leave-game";
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

describe("leaveGame", () => {
  it("posts to the game's leave endpoint", async () => {
    mockedHttp.post.mockResolvedValue(undefined);

    await leaveGame({ gameId: "game-1" });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/game/game-1/leave",
      undefined,
      { headers: undefined, signal: undefined }
    );
  });
});
