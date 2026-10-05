import { describe, expect, it, vi } from "vitest";
import { getAdminDashboardStats } from "./get-admin-dashboard-stats";
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

describe("getAdminDashboardStats", () => {
  it("requests the admin dashboard stats", async () => {
    const stats = {
      totalUsers: 1,
      totalProblems: 2,
      totalGames: 3,
      totalSubmissions: 4,
      newUsersByDay: [],
      feedbackByStatus: [],
    };
    mockedHttp.get.mockResolvedValue(stats);

    const result = await getAdminDashboardStats();

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/dashboard/admin",
      expect.anything()
    );
    expect(result).toBe(stats);
  });
});
