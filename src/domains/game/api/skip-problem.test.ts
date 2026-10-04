import { describe, expect, it, vi } from "vitest";
import { skipProblem } from "./skip-problem";
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

describe("skipProblem", () => {
  it("posts to the problem's skip endpoint with no body", async () => {
    mockedHttp.post.mockResolvedValue({
      skipsRemaining: 2,
      nextProblemId: "p-2",
    });

    const result = await skipProblem({
      gameId: "game-1",
      problemId: "problem-1",
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/game/game-1/problems/problem-1/skip",
      undefined,
      { headers: undefined, signal: undefined }
    );
    expect(result).toEqual({ skipsRemaining: 2, nextProblemId: "p-2" });
  });
});
