import { describe, expect, it, vi } from "vitest";
import { getAdminUsers } from "./get-admin-users";
import { http } from "@/shared/lib/http";
import { buildAdminUser } from "@/test/factories/user-admin-user";

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

describe("getAdminUsers", () => {
  it("gets a page of admin users with the pagination params", async () => {
    const controller = new AbortController();
    const page = {
      results: [buildAdminUser()],
      total: 1,
      page: 0,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    mockedHttp.get.mockResolvedValue(page);

    const result = await getAdminUsers({
      page: 0,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
      signal: controller.signal,
    });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/user/admin", {
      headers: undefined,
      signal: controller.signal,
      params: {
        page: 0,
        size: 20,
        timestamp: "2026-01-01T00:00:00.000Z",
        search: undefined,
      },
    });
    expect(result).toEqual(page);
  });

  it("includes the search term when provided", async () => {
    const controller = new AbortController();
    mockedHttp.get.mockResolvedValue({
      results: [],
      total: 0,
      page: 0,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
    });

    await getAdminUsers({
      page: 0,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
      search: "alice",
      signal: controller.signal,
    });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/user/admin", {
      headers: undefined,
      signal: controller.signal,
      params: {
        page: 0,
        size: 20,
        timestamp: "2026-01-01T00:00:00.000Z",
        search: "alice",
      },
    });
  });
});
