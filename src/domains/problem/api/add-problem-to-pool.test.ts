import { describe, expect, it, vi } from "vitest";
import { addProblemToPool } from "./add-problem-to-pool";
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

describe("addProblemToPool", () => {
  it("puts the problem into the pool's problems endpoint", async () => {
    mockedHttp.put.mockResolvedValue(undefined);

    await addProblemToPool({ poolKey: "daily", problemId: "problem_1" });

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/api/v1/problempool/daily/problems/problem_1",
      undefined,
      expect.anything()
    );
  });
});
