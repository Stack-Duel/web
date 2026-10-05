import { describe, expect, it, vi } from "vitest";
import { getAdminFeedbackDetail } from "./get-admin-feedback-detail";
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

describe("getAdminFeedbackDetail", () => {
  it("requests the feedback by id", async () => {
    const detail = { id: "feedback_1" };
    mockedHttp.get.mockResolvedValue(detail);

    const result = await getAdminFeedbackDetail({ id: "feedback_1" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/feedback/admin/feedback_1",
      expect.anything()
    );
    expect(result).toBe(detail);
  });
});
