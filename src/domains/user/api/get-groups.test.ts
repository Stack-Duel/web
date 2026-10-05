import { describe, expect, it, vi } from "vitest";
import { getGroups } from "./get-groups";
import { http } from "@/shared/lib/http";
import { buildGroup } from "@/test/factories/user-group";

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

describe("getGroups", () => {
  it("gets the group list endpoint", async () => {
    const controller = new AbortController();
    const groups = [buildGroup()];
    mockedHttp.get.mockResolvedValue(groups);

    const result = await getGroups({ signal: controller.signal });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/group", {
      headers: undefined,
      signal: controller.signal,
    });
    expect(result).toEqual(groups);
  });
});
