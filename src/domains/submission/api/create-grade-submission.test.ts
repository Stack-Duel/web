import { describe, expect, it, vi } from "vitest";
import { createGradeSubmission } from "./create-grade-submission";
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

describe("createGradeSubmission", () => {
  it("posts the problemSetupId and code, excluding signal from the body", async () => {
    mockedHttp.post.mockResolvedValue("submission_1");

    const result = await createGradeSubmission({
      problemSetupId: "setup_1",
      code: "function twoSum() {}",
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/submission/grade",
      { problemSetupId: "setup_1", code: "function twoSum() {}" },
      expect.anything()
    );
    expect(result).toBe("submission_1");
  });
});
