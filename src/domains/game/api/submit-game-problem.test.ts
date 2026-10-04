import { describe, expect, it, vi } from "vitest";
import { submitGameProblem } from "./submit-game-problem";
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

describe("submitGameProblem", () => {
  it("posts the code and setup id to the problem's submit endpoint", async () => {
    mockedHttp.post.mockResolvedValue("submission-1");

    const result = await submitGameProblem({
      gameId: "game-1",
      problemId: "problem-1",
      body: { problemSetupId: "setup-1", code: "print(1)" },
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/game/game-1/problems/problem-1/submit",
      { problemSetupId: "setup-1", code: "print(1)" },
      { headers: undefined, signal: undefined }
    );
    expect(result).toBe("submission-1");
  });
});
