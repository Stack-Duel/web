import { describe, expect, it, vi } from "vitest";
import { joinGameByCode } from "./join-game-by-code";
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

describe("joinGameByCode", () => {
  it("posts the code to the join-by-code endpoint", async () => {
    mockedHttp.post.mockResolvedValue("game-1");

    await joinGameByCode({ joinCode: "ABC1234" });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/game/join-by-code",
      { joinCode: "ABC1234" },
      { headers: undefined, signal: undefined }
    );
  });
});
