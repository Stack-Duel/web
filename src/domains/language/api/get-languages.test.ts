import { describe, expect, it, vi } from "vitest";
import { getLanguages } from "./get-languages";
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

describe("getLanguages", () => {
  it("gets the language list endpoint and forwards the abort signal", async () => {
    const controller = new AbortController();
    mockedHttp.get.mockResolvedValue([{ id: "1", name: "TypeScript" }]);

    const result = await getLanguages({ signal: controller.signal });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/language", {
      headers: undefined,
      signal: controller.signal,
    });
    expect(result).toEqual([{ id: "1", name: "TypeScript" }]);
  });
});
