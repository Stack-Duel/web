import { describe, expect, it, vi } from "vitest";
import { getAvatarHistory } from "./get-avatar-history";
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

describe("getAvatarHistory", () => {
  it("gets the avatar history from the avatar-history endpoint", async () => {
    const controller = new AbortController();
    mockedHttp.get.mockResolvedValue([]);

    await getAvatarHistory({ signal: controller.signal });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/user/avatar-history", {
      headers: undefined,
      signal: controller.signal,
    });
  });
});
