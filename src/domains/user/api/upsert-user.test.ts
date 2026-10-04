import { describe, expect, it, vi } from "vitest";
import { upsertUser } from "./upsert-user";
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

describe("upsertUser", () => {
  it("puts the auth0 sub to the user endpoint and resolves the created user", async () => {
    const controller = new AbortController();
    const user = buildUser();
    mockedHttp.put.mockResolvedValue(user);

    const result = await upsertUser({
      sub: "auth0|123",
      signal: controller.signal,
    });

    expect(mockedHttp.put).toHaveBeenCalledWith(
      "/api/v1/user",
      { sub: "auth0|123" },
      { headers: undefined, signal: controller.signal }
    );
    expect(result).toEqual(user);
  });
});
