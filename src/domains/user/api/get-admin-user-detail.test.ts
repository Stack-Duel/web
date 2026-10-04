import { describe, expect, it, vi } from "vitest";
import { getAdminUserDetail } from "./get-admin-user-detail";
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

describe("getAdminUserDetail", () => {
  it("requests the user by id", async () => {
    const detail = { id: "user_1" };
    mockedHttp.get.mockResolvedValue(detail);

    const result = await getAdminUserDetail({ id: "user_1" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/user/admin/user_1",
      expect.anything()
    );
    expect(result).toBe(detail);
  });
});
