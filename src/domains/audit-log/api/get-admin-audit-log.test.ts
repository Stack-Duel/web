import { describe, expect, it, vi } from "vitest";
import { getAdminAuditLog } from "./get-admin-audit-log";
import { http } from "@/shared/lib/http";
import { buildAuditLogEntry } from "@/test/factories/audit-log-entry";

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

describe("getAdminAuditLog", () => {
  it("gets a page of audit log entries with the pagination params", async () => {
    const controller = new AbortController();
    const page = {
      results: [buildAuditLogEntry()],
      total: 1,
      page: 0,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    mockedHttp.get.mockResolvedValue(page);

    const result = await getAdminAuditLog({
      page: 0,
      size: 20,
      timestamp: "2026-01-01T00:00:00.000Z",
      signal: controller.signal,
    });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/audit-log", {
      headers: undefined,
      signal: controller.signal,
      params: { page: 0, size: 20, timestamp: "2026-01-01T00:00:00.000Z" },
    });
    expect(result).toEqual(page);
  });
});
