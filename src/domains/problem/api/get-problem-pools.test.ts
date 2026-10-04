import { describe, expect, it, vi } from "vitest";
import { getProblemPools } from "./get-problem-pools";
import { http } from "@/shared/lib/http";
import { buildProblemPool } from "@/test/factories/problem";

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

describe("getProblemPools", () => {
  it("requests the problem pools list", async () => {
    const pools = [buildProblemPool()];
    mockedHttp.get.mockResolvedValue(pools);

    const result = await getProblemPools({});

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/problempool",
      expect.anything()
    );
    expect(result).toEqual(pools);
  });
});
