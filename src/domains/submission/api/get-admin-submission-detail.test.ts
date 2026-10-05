import { describe, expect, it, vi } from "vitest";
import { getAdminSubmissionDetail } from "./get-admin-submission-detail";
import { http } from "@/shared/lib/http";
import { buildAdminSubmissionDetail } from "@/test/factories/submission";

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

describe("getAdminSubmissionDetail", () => {
  it("requests the admin submission by id", async () => {
    const detail = buildAdminSubmissionDetail();
    mockedHttp.get.mockResolvedValue(detail);

    const result = await getAdminSubmissionDetail({ id: "submission_1" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/submission/admin/submission_1",
      expect.anything()
    );
    expect(result).toEqual(detail);
  });
});
