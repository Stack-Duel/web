import { describe, expect, it, vi } from "vitest";
import { selectAvatar } from "./select-avatar";
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

describe("selectAvatar", () => {
  it("puts to the avatar/{id} endpoint", async () => {
    const controller = new AbortController();
    mockedHttp.put.mockResolvedValue(undefined);

    await selectAvatar({ avatarId: "avatar_1", signal: controller.signal });

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/api/v1/user/avatar/avatar_1",
      undefined,
      { headers: undefined, signal: controller.signal }
    );
  });
});
