import { describe, expect, it, vi } from "vitest";
import { getAdminProblemDetail } from "./get-admin-problem-detail";
import { http } from "@/shared/lib/http";
import { buildAdminProblemDetail } from "@/test/factories/problem";

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

describe("getAdminProblemDetail", () => {
  it("requests the admin problem by id", async () => {
    const detail = buildAdminProblemDetail();
    mockedHttp.get.mockResolvedValue(detail);

    const result = await getAdminProblemDetail({ id: "problem_1" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/problem/admin/problem_1",
      expect.anything()
    );
    expect(result).toEqual(detail);
  });
});
