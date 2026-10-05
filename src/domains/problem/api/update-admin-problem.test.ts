import { describe, expect, it, vi } from "vitest";
import { updateAdminProblem } from "./update-admin-problem";
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

describe("updateAdminProblem", () => {
  it("PUTs the updated problem fields, excluding the id and signal from the body", async () => {
    mockedHttp.put.mockResolvedValue(undefined);

    await updateAdminProblem({
      id: "problem_1",
      title: "Two Sum",
      question: "Given an array...",
      difficulty: 2,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      tags: ["arrays"],
      status: "Published",
    });

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/api/v1/problem/admin/problem_1",
      {
        title: "Two Sum",
        question: "Given an array...",
        difficulty: 2,
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        tags: ["arrays"],
        status: "Published",
      },
      expect.anything()
    );
  });
});
