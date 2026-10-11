import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccessTokenError } from "@auth0/nextjs-auth0/errors";
import { getAccessToken } from "@auth0/nextjs-auth0";
import {
  getSharedAccessToken,
  getSharedBearerToken,
  resetSharedAccessToken,
} from "./get-shared-access-token";

vi.mock("@auth0/nextjs-auth0", () => ({ getAccessToken: vi.fn() }));

const mockGetAccessToken = vi.mocked(getAccessToken);

describe("getSharedAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSharedAccessToken();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the token when Auth0 hands one over", async () => {
    mockGetAccessToken.mockResolvedValue("token-123");

    await expect(getSharedAccessToken()).resolves.toEqual({
      status: "token",
      token: "token-123",
    });
  });

  it("shares one in-flight request across concurrent callers", async () => {
    mockGetAccessToken.mockResolvedValue("token-123");

    await Promise.all([
      getSharedAccessToken(),
      getSharedAccessToken(),
      getSharedAccessToken(),
    ]);

    expect(mockGetAccessToken).toHaveBeenCalledTimes(1);
  });

  it.each([
    "missing_session",
    "missing_refresh_token",
    "failed_to_refresh_token",
    "session_expired",
  ])("reports a dead session for the %s error code", async (code) => {
    mockGetAccessToken.mockRejectedValue(
      new AccessTokenError(code, "no token for you")
    );

    await expect(getSharedAccessToken()).resolves.toEqual({
      status: "session-expired",
    });
  });

  it("treats an unrecognised failure as transient rather than a dead session", async () => {
    mockGetAccessToken.mockRejectedValue(new Error("network down"));

    await expect(getSharedAccessToken()).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("treats an empty token as transient", async () => {
    mockGetAccessToken.mockResolvedValue("");

    await expect(getSharedAccessToken()).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("caches a dead session instead of re-asking Auth0 on every request", async () => {
    mockGetAccessToken.mockRejectedValue(
      new AccessTokenError("failed_to_refresh_token", "expired")
    );

    await getSharedAccessToken();
    await getSharedAccessToken();
    await getSharedAccessToken();

    expect(mockGetAccessToken).toHaveBeenCalledTimes(1);
  });

  it("asks Auth0 again once the dead-session cache expires", async () => {
    vi.useFakeTimers();
    mockGetAccessToken.mockRejectedValue(
      new AccessTokenError("failed_to_refresh_token", "expired")
    );

    await getSharedAccessToken();
    vi.advanceTimersByTime(30_001);
    await getSharedAccessToken();

    expect(mockGetAccessToken).toHaveBeenCalledTimes(2);
  });

  it("retries after a transient failure without caching it", async () => {
    mockGetAccessToken.mockRejectedValueOnce(new Error("network down"));
    mockGetAccessToken.mockResolvedValueOnce("token-123");

    await expect(getSharedAccessToken()).resolves.toEqual({
      status: "unavailable",
    });
    await expect(getSharedAccessToken()).resolves.toEqual({
      status: "token",
      token: "token-123",
    });
  });
});

describe("getSharedBearerToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSharedAccessToken();
  });

  it("returns the raw token when there is one", async () => {
    mockGetAccessToken.mockResolvedValue("token-123");

    await expect(getSharedBearerToken()).resolves.toBe("token-123");
  });

  it("returns an empty string when no token is available", async () => {
    mockGetAccessToken.mockRejectedValue(
      new AccessTokenError("missing_session", "no session")
    );

    await expect(getSharedBearerToken()).resolves.toBe("");
  });
});
