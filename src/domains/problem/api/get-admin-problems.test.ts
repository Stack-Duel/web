import { describe, expect, it, vi } from "vitest";
import { getAdminProblems } from "./get-admin-problems";
import { http } from "@/shared/lib/http";
import { buildAdminProblemListItem } from "@/test/factories/problem";

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

describe("getAdminProblems", () => {
  it("requests a page of admin problems with the given params", async () => {
    const page = {
      results: [buildAdminProblemListItem()],
      total: 1,
      page: 1,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    mockedHttp.get.mockResolvedValue(page);

    const result = await getAdminProblems({
      page: 1,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
      search: "two sum",
    });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/problem/admin",
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
