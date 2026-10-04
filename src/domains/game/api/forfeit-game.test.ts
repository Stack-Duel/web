import { describe, expect, it, vi } from "vitest";
import { forfeitGame } from "./forfeit-game";
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

describe("forfeitGame", () => {
  it("posts to the game's forfeit endpoint", async () => {
    mockedHttp.post.mockResolvedValue(undefined);

    await forfeitGame({ gameId: "game-1" });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/game/game-1/forfeit",
      undefined,
      { headers: undefined, signal: undefined }
    );
  });
});
