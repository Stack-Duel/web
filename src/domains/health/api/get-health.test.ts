import { describe, expect, it, vi } from "vitest";
import { getHealth } from "./get-health";
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

describe("getHealth", () => {
  it("gets the health endpoint and forwards the abort signal", async () => {
    const controller = new AbortController();
    mockedHttp.get.mockResolvedValue({ status: "ok", timestamp: "now" });

    const result = await getHealth({ signal: controller.signal });

    expect(mockedHttp.get).toHaveBeenCalledWith("/api/v1/health", {
      headers: undefined,
      signal: controller.signal,
    });
    expect(result).toEqual({ status: "ok", timestamp: "now" });
  });
});
