import { describe, expect, it, vi } from "vitest";
import { createGame } from "./create-game";
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

describe("createGame", () => {
  it("posts the game mode and time limit, excluding the signal from the body", async () => {
    mockedHttp.post.mockResolvedValue("new-game-id");

    const result = await createGame({
      gameModeKey: GameModeKey.Duel,
      timeLimitInSeconds: 600,
      trackSelections: [
        { trackKey: "general-purpose", languageIds: ["lang-js"] },
      ],
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/game",
      {
        gameModeKey: GameModeKey.Duel,
        timeLimitInSeconds: 600,
        trackSelections: [
          { trackKey: "general-purpose", languageIds: ["lang-js"] },
        ],
      },
      { headers: undefined, signal: undefined }
    );
    expect(result).toBe("new-game-id");
  });
});
