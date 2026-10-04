import { describe, expect, it, vi } from "vitest";
import { updateProfilePrivacy } from "./update-profile-privacy";
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

describe("updateProfilePrivacy", () => {
  it("puts the isPrivate flag to the profile-privacy endpoint", async () => {
    const controller = new AbortController();
    mockedHttp.put.mockResolvedValue(undefined);

    await updateProfilePrivacy({ isPrivate: true, signal: controller.signal });

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/api/v1/user/profile-privacy",
      { isPrivate: true },
      { headers: undefined, signal: controller.signal }
    );
  });
});
