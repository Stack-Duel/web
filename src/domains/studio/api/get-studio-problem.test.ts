import { describe, expect, it, vi } from "vitest";
import { getStudioProblems } from "./get-studio-problem";
import { http } from "@/shared/lib/http";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";

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

describe("getStudioProblems", () => {
  it("requests the studio problem by id", async () => {
    const details = buildStudioProblemDetails();
    mockedHttp.get.mockResolvedValue(details);

    const result = await getStudioProblems({ problemId: "problem_1" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/studio/problems/problem_1",
      expect.anything()
    );
    expect(result).toEqual(details);
  });
});
