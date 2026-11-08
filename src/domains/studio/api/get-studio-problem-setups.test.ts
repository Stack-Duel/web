import { describe, expect, it, vi } from "vitest";
import { getStudioProblemSetups } from "./get-studio-problem-setups";
import { http } from "@/shared/lib/http";
import { buildStudioProblemSetup } from "@/test/factories/studio-problem-setup";

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

describe("getStudioProblemSetups", () => {
  it("requests the studio problem's setups by id", async () => {
    const setups = [buildStudioProblemSetup()];
    mockedHttp.get.mockResolvedValue(setups);

    const result = await getStudioProblemSetups({ problemId: "problem_1" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/studio/problems/problem_1/setups",
      expect.anything()
    );
    expect(result).toEqual(setups);
  });
});
