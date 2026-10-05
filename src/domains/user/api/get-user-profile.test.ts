import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUserProfile } from "./get-user-profile";
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

describe("getUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets the profile endpoint for the given username", async () => {
    const controller = new AbortController();
    mockedHttp.get.mockResolvedValue({ id: "1", username: "testuser" });

    const result = await getUserProfile({
      username: "testuser",
      signal: controller.signal,
    });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/user/profile/testuser",
      { headers: undefined, signal: controller.signal }
    );
    expect(result).toEqual({ id: "1", username: "testuser" });
  });

  it("URL-encodes usernames with special characters", async () => {
    mockedHttp.get.mockResolvedValue({ id: "1" });

    await getUserProfile({ username: "two words/slash" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/user/profile/two%20words%2Fslash",
      { headers: undefined, signal: undefined }
    );
  });
});
