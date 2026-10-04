import { describe, expect, it, vi } from "vitest";
import { createRunSubmission } from "./create-run-submission";
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

describe("createRunSubmission", () => {
  it("posts the problemSetupId, code, and custom test cases", async () => {
    mockedHttp.post.mockResolvedValue("submission_1");

    const result = await createRunSubmission({
      problemSetupId: "setup_1",
      code: "function twoSum() {}",
      customTestCases: [{ inputs: ["[1,2]"] }],
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/submission/run",
      {
        problemSetupId: "setup_1",
        code: "function twoSum() {}",
        customTestCases: [{ inputs: ["[1,2]"] }],
      },
      expect.anything()
    );
    expect(result).toBe("submission_1");
  });
});
