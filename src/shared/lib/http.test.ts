import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "./http";
import { apiClient } from "./api-client";

vi.mock("./api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient, { deep: true });

describe("http", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("get resolves with the response data", async () => {
    mockedApiClient.get.mockResolvedValue({ data: { id: 1 } });

    const result = await http.get("/problems");

    expect(mockedApiClient.get).toHaveBeenCalledWith("/problems", undefined);
    expect(result).toEqual({ id: 1 });
  });

  it("post forwards the body and config, resolving with the response data", async () => {
    mockedApiClient.post.mockResolvedValue({ data: { created: true } });

    const result = await http.post(
      "/problems",
      { title: "Two Sum" },
      { timeout: 1000 }
    );

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      "/problems",
      { title: "Two Sum" },
      { timeout: 1000 }
    );
    expect(result).toEqual({ created: true });
  });

  it("put forwards the body, resolving with the response data", async () => {
    mockedApiClient.put.mockResolvedValue({ data: { updated: true } });

    const result = await http.put("/problems/1", { title: "Renamed" });

    expect(mockedApiClient.put).toHaveBeenCalledWith(
      "/problems/1",
      { title: "Renamed" },
      undefined
    );
    expect(result).toEqual({ updated: true });
  });

  it("patch forwards the body, resolving with the response data", async () => {
    mockedApiClient.patch.mockResolvedValue({ data: { patched: true } });

    const result = await http.patch("/problems/1", { title: "Patched" });

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      "/problems/1",
      { title: "Patched" },
      undefined
    );
    expect(result).toEqual({ patched: true });
  });

  it("delete resolves with the response data", async () => {
    mockedApiClient.delete.mockResolvedValue({ data: { deleted: true } });

    const result = await http.delete("/problems/1");

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      "/problems/1",
      undefined
    );
    expect(result).toEqual({ deleted: true });
  });
});
