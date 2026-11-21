import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAccessToken } from "@auth0/nextjs-auth0";
import {
  clearSharedAccessToken,
  getSharedAccessToken,
} from "./get-shared-access-token";

vi.mock("@auth0/nextjs-auth0", () => ({ getAccessToken: vi.fn() }));

const mockGetAccessToken = vi.mocked(getAccessToken);

function respondWith(token: string, expiresInSeconds = 3600) {
  mockGetAccessToken.mockResolvedValue({
    token,
    expires_in: expiresInSeconds,
  } as unknown as Awaited<ReturnType<typeof getAccessToken>>);
}

describe("getSharedAccessToken", () => {
  beforeEach(() => {
    mockGetAccessToken.mockReset();
    clearSharedAccessToken();
  });

  it("fetches the token once and reuses it", async () => {
    respondWith("token-1");

    await getSharedAccessToken();
    await getSharedAccessToken();
    const third = await getSharedAccessToken();

    expect(third).toBe("token-1");
    expect(mockGetAccessToken).toHaveBeenCalledTimes(1);
  });

  it("coalesces concurrent callers into one fetch", async () => {
    respondWith("token-1");

    const [first, second] = await Promise.all([
      getSharedAccessToken(),
      getSharedAccessToken(),
    ]);

    expect(first).toBe("token-1");
    expect(second).toBe("token-1");
    expect(mockGetAccessToken).toHaveBeenCalledTimes(1);
  });

  it("refetches a token that is about to expire", async () => {
    respondWith("token-1", 30);
    await getSharedAccessToken();

    respondWith("token-2", 3600);
    const next = await getSharedAccessToken();

    expect(next).toBe("token-2");
    expect(mockGetAccessToken).toHaveBeenCalledTimes(2);
  });

  it("forces a fresh fetch when asked", async () => {
    respondWith("token-1");
    await getSharedAccessToken();

    respondWith("token-2");
    const refreshed = await getSharedAccessToken({ forceRefresh: true });

    expect(refreshed).toBe("token-2");
    expect(mockGetAccessToken).toHaveBeenCalledTimes(2);
  });

  it("returns undefined without a session and does not hammer the route", async () => {
    mockGetAccessToken.mockRejectedValue(new Error("no session"));

    expect(await getSharedAccessToken()).toBeUndefined();
    expect(await getSharedAccessToken()).toBeUndefined();

    expect(mockGetAccessToken).toHaveBeenCalledTimes(1);
  });

  it("does not cache a token with an unknown expiry", async () => {
    mockGetAccessToken.mockResolvedValue({
      token: "token-1",
    } as unknown as Awaited<ReturnType<typeof getAccessToken>>);

    await getSharedAccessToken();
    await getSharedAccessToken();

    expect(mockGetAccessToken).toHaveBeenCalledTimes(2);
  });
});
