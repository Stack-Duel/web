import { describe, expect, it, vi } from "vitest";
import { getProblemSetup } from "./get-problem-setup";
import { http } from "@/shared/lib/http";
import { buildProblemSetup } from "@/test/factories/problem";

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

describe("getProblemSetup", () => {
  it("requests the setup for a problem slug and language version", async () => {
    const setup = buildProblemSetup();
    mockedHttp.get.mockResolvedValue(setup);

    const result = await getProblemSetup({
      slug: "two-sum",
      languageVersionId: "lang_1",
    });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/problem/two-sum/setup",
      expect.objectContaining({ params: { languageVersionId: "lang_1" } })
    );
    expect(result).toEqual(setup);
  });
});
