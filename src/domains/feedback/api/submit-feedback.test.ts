import { describe, expect, it, vi } from "vitest";
import { submitFeedback } from "./submit-feedback";
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

describe("submitFeedback", () => {
  it("posts the feedback payload", async () => {
    mockedHttp.post.mockResolvedValue("feedback_1");

    const result = await submitFeedback({
      type: "Bug",
      message: "The submit button is unresponsive.",
      rating: 3,
      contextType: "None",
      contextEntityId: null,
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/feedback",
      {
        type: "Bug",
        message: "The submit button is unresponsive.",
        rating: 3,
        contextType: "None",
        contextEntityId: null,
      },
      expect.anything()
    );
    expect(result).toBe("feedback_1");
  });
});
