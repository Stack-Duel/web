import { describe, expect, it, vi } from "vitest";
import { getAdminSubmissions } from "./get-admin-submissions";
import { http } from "@/shared/lib/http";
import { buildAdminSubmissionListItem } from "@/test/factories/submission";

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

describe("getAdminSubmissions", () => {
  it("requests a page of admin submissions, optionally filtered by id", async () => {
    const page = {
      results: [buildAdminSubmissionListItem()],
      total: 1,
      page: 1,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    mockedHttp.get.mockResolvedValue(page);

    const result = await getAdminSubmissions({
      page: 1,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
      id: "11111111-1111-1111-1111-111111111111",
    });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/submission/admin",
      expect.objectContaining({
        params: {
          page: 1,
          size: 20,
          timestamp: "2026-01-01T00:00:00.000Z",
          id: "11111111-1111-1111-1111-111111111111",
        },
      })
    );
    expect(result).toEqual(page);
  });

  it("omits the id filter when not provided", async () => {
    mockedHttp.get.mockResolvedValue({
      results: [],
      total: 0,
      page: 1,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
    });

    await getAdminSubmissions({
      page: 1,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
    });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/submission/admin",
      expect.objectContaining({
        params: {
          page: 1,
          size: 20,
          timestamp: "2026-01-01T00:00:00.000Z",
          id: undefined,
        },
      })
    );
  });
});
