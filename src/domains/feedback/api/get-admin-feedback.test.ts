import { describe, expect, it, vi } from "vitest";
import { getAdminFeedback } from "./get-admin-feedback";
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

describe("getAdminFeedback", () => {
  it("requests a page of feedback with the given filters", async () => {
    const page = {
      results: [],
      total: 0,
      page: 1,
      size: 20,
      timestamp: "2026-08-30T00:00:00.000Z",
    };
    mockedHttp.get.mockResolvedValue(page);

    const result = await getAdminFeedback({
      page: 1,
      size: 20,
      timestamp: "2026-08-30T00:00:00.000Z",
      type: "Bug",
      status: "New",
    });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/feedback/admin",
      expect.objectContaining({
        params: {
          page: 1,
          size: 20,
          timestamp: "2026-08-30T00:00:00.000Z",
          type: "Bug",
          status: "New",
        },
      })
    );
    expect(result).toBe(page);
  });
});
