import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAccount } from "./get-account";
import { http } from "@/shared/lib/http";
import { buildUser } from "@/test/factories/user";

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

describe("getAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets the current user's account endpoint and forwards the abort signal", async () => {
    const controller = new AbortController();
    const user = buildUser();
    mockedHttp.get.mockResolvedValue(user);

    const result = await getAccount({ signal: controller.signal });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/user", {
      headers: undefined,
      signal: controller.signal,
    });
    expect(result).toEqual(user);
  });
});
