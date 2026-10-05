import { describe, expect, it, vi } from "vitest";
import { completeProblem } from "./complete-problem";
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

describe("completeProblem", () => {
  it("posts the submission id to the problem's complete endpoint", async () => {
    mockedHttp.post.mockResolvedValue({ newScore: 10, nextProblemId: "p-2" });

    const result = await completeProblem({
      gameId: "game-1",
      problemId: "problem-1",
      body: { submissionId: "sub-1" },
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/game/game-1/problems/problem-1/complete",
      { submissionId: "sub-1" },
      { headers: undefined, signal: undefined }
    );
    expect(result).toEqual({ newScore: 10, nextProblemId: "p-2" });
  });
});
