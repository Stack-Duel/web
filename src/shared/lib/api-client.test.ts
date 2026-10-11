import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { apiClient } from "./api-client";
import { SessionExpiredError } from "./api-error";
import { getSharedAccessToken } from "./get-shared-access-token";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("./get-shared-access-token", () => ({
  getSharedAccessToken: vi.fn(),
}));

const mockGetSharedAccessToken = vi.mocked(getSharedAccessToken);
const originalAdapter = apiClient.defaults.adapter;

type StubbedResponse = { status: number; data?: unknown };

/**
 * Replaces the transport so the interceptors run against canned responses. Returns
 * the configs the adapter was handed, which is how "was the request sent at all?"
 * and "which token did it carry?" get asserted.
 */
function stubTransport(responses: StubbedResponse[]) {
  const sent: InternalAxiosRequestConfig[] = [];
  let callCount = 0;

  const adapter: AxiosAdapter = async (config) => {
    sent.push(config);
    const stub = responses[Math.min(callCount, responses.length - 1)];
    callCount += 1;

    const response = {
      status: stub.status,
      statusText: String(stub.status),
      data: stub.data,
      headers: {},
      config,
    } as AxiosResponse;

    if (stub.status >= 200 && stub.status < 300) return response;

    throw Object.assign(
      new Error(`Request failed with status code ${stub.status}`),
      { isAxiosError: true, config, response }
    );
  };

  apiClient.defaults.adapter = adapter;
  return sent;
}

describe("apiClient", () => {
  beforeEach(() => {
    // reset, not clear: a leftover implementation from a previous test would
    // answer the extra token lookup the 401 retry makes.
    mockGetSharedAccessToken.mockReset();
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it("attaches the bearer token to API requests", async () => {
    mockGetSharedAccessToken.mockResolvedValue({
      status: "token",
      token: "token-123",
    });
    const sent = stubTransport([{ status: 200, data: { id: "u1" } }]);

    await apiClient.get("/api/v1/user");

    expect(sent[0].headers.Authorization).toBe("Bearer token-123");
  });

  it("sends the request unauthenticated when a token is merely unavailable", async () => {
    mockGetSharedAccessToken.mockResolvedValue({ status: "unavailable" });
    const sent = stubTransport([{ status: 200, data: { id: "u1" } }]);

    await apiClient.get("/api/v1/user");

    expect(sent[0].headers.Authorization).toBeUndefined();
  });

  it("throws SessionExpiredError without sending a request the session can't authenticate", async () => {
    mockGetSharedAccessToken.mockResolvedValue({ status: "session-expired" });
    const sent = stubTransport([{ status: 200, data: { id: "u1" } }]);

    await expect(apiClient.get("/api/v1/user")).rejects.toBeInstanceOf(
      SessionExpiredError
    );
    expect(sent).toHaveLength(0);
  });

  it("retries a 401 once with a freshly fetched token", async () => {
    // The retry re-dispatches through the request interceptor, so the token is
    // looked up once more after the refresh.
    mockGetSharedAccessToken
      .mockResolvedValueOnce({ status: "token", token: "stale" })
      .mockResolvedValue({ status: "token", token: "fresh" });
    const sent = stubTransport([
      { status: 401 },
      { status: 200, data: { id: "u1" } },
    ]);

    const response = await apiClient.get("/api/v1/user");

    expect(response.data).toEqual({ id: "u1" });
    expect(sent).toHaveLength(2);
    expect(sent[1].headers.Authorization).toBe("Bearer fresh");
  });

  it("throws SessionExpiredError when a 401 can't be retried with a new token", async () => {
    mockGetSharedAccessToken
      .mockResolvedValueOnce({ status: "token", token: "stale" })
      .mockResolvedValueOnce({ status: "session-expired" });
    stubTransport([{ status: 401 }]);

    await expect(apiClient.get("/api/v1/user")).rejects.toBeInstanceOf(
      SessionExpiredError
    );
  });

  it("surfaces the problem-details message for ordinary failures", async () => {
    mockGetSharedAccessToken.mockResolvedValue({
      status: "token",
      token: "token-123",
    });
    stubTransport([
      { status: 500, data: { message: "Something broke server-side" } },
    ]);

    await expect(apiClient.get("/api/v1/user")).rejects.toThrow(
      "Something broke server-side"
    );
  });
});
