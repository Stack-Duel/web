import { describe, expect, it, vi } from "vitest";
import { getProblemById } from "./get-problem-by-id";
import { http } from "@/shared/lib/http";
import { buildProblem } from "@/test/factories/problem";

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

describe("getProblemById", () => {
  it("requests the problem by id", async () => {
    const problem = buildProblem();
    mockedHttp.get.mockResolvedValue(problem);

    const result = await getProblemById({ id: "problem_1" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/problem/by-id/problem_1",
      expect.anything()
    );
    expect(result).toEqual(problem);
  });
});
