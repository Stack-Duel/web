import { describe, expect, it, vi } from "vitest";
import { updateUserGroups } from "./update-user-groups";
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

describe("updateUserGroups", () => {
  it("puts the group ids to the user's groups endpoint", async () => {
    const controller = new AbortController();
    mockedHttp.put.mockResolvedValue(undefined);

    await updateUserGroups({
      userId: "user_1",
      groupIds: ["group_1", "group_2"],
      signal: controller.signal,
    });

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/api/v1/user/user_1/groups",
      { groupIds: ["group_1", "group_2"] },
      { headers: undefined, signal: controller.signal }
    );
  });
});
