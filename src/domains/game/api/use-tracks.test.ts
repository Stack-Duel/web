import { describe, expect, it, vi } from "vitest";
import { getTracks } from "./use-tracks";
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

describe("getTracks", () => {
  it("gets the available tracks", async () => {
    mockedHttp.get.mockResolvedValue([]);

    const result = await getTracks({});

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/game/tracks", {
      headers: undefined,
      signal: undefined,
    });
    expect(result).toEqual([]);
  });
});
