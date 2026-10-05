import { describe, expect, it, vi } from "vitest";
import { getProblems } from "./use-problems";
import { http } from "@/shared/lib/http";
import { buildProblemSummary } from "@/test/factories/problem";

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

describe("getProblems", () => {
  it("requests a page of problems with the given params", async () => {
    const page = {
      results: [buildProblemSummary()],
      total: 1,
      page: 1,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    mockedHttp.get.mockResolvedValue(page);

    const result = await getProblems({
      page: 1,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
      search: "two sum",
    });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/problem",
      expect.objectContaining({
        params: {
          page: 1,
          size: 20,
          timestamp: "2026-01-01T00:00:00.000Z",
          search: "two sum",
        },
      })
    );
    expect(result).toEqual(page);
  });
});
