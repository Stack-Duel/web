import { describe, expect, it, vi } from "vitest";
import { updateUsername } from "./update-username";
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

describe("updateUsername", () => {
  it("puts the username, bio, and language ids to the user endpoint", async () => {
    const controller = new AbortController();
    mockedHttp.put.mockResolvedValue(undefined);

    await updateUsername({
      username: "newname",
      bio: "hello",
      languageIds: ["lang_1"],
      signal: controller.signal,
    });

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/api/v1/user",
      { username: "newname", bio: "hello", languageIds: ["lang_1"] },
      { headers: undefined, signal: controller.signal }
    );
  });
});
