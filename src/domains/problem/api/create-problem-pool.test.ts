import { describe, expect, it, vi } from "vitest";
import { createProblemPool } from "./create-problem-pool";
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

describe("createProblemPool", () => {
  it("posts the pool key, name, and description", async () => {
    mockedHttp.post.mockResolvedValue("pool_1");

    await createProblemPool({
      key: "daily",
      name: "Daily challenge",
      description: "Rotates every day",
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/api/v1/problempool",
      {
        key: "daily",
        name: "Daily challenge",
        description: "Rotates every day",
      },
      expect.anything()
    );
  });
});
