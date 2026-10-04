import { describe, expect, it, vi } from "vitest";
import { removeProblemFromPool } from "./remove-problem-from-pool";
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

describe("removeProblemFromPool", () => {
  it("deletes the problem from the pool's problems endpoint", async () => {
    mockedHttp.delete.mockResolvedValue(undefined);

    await removeProblemFromPool({ poolKey: "daily", problemId: "problem_1" });

    expect(mockedHttp.delete).toHaveBeenCalledWith(
      "/api/v1/problempool/daily/problems/problem_1",
      expect.anything()
    );
  });
});
