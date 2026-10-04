import { describe, expect, it, vi } from "vitest";
import { updateFeedbackStatus } from "./update-feedback-status";
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

describe("updateFeedbackStatus", () => {
  it("patches the feedback status and admin note", async () => {
    mockedHttp.patch.mockResolvedValue(undefined);

    await updateFeedbackStatus({
      id: "feedback_1",
      status: "Triaged",
      adminNote: "Looking into it.",
    });

    expect(mockedHttp.patch).toHaveBeenCalledWith(
      "/api/v1/feedback/admin/feedback_1/status",
      { status: "Triaged", adminNote: "Looking into it." },
      expect.anything()
    );
  });
});
