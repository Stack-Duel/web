import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { useUserSync } from "./use-user-sync";
import { useUpsertUser } from "../api/upsert-user";
import { accountQueryOptions } from "../api/get-account";
import { useUserStore } from "../state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { SessionExpiredError } from "@/shared/lib/api-error";

vi.mock("../api/upsert-user", () => ({ useUpsertUser: vi.fn() }));
vi.mock("../api/get-account", () => ({ accountQueryOptions: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), info: vi.fn() } }));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useUserSync", () => {
  beforeEach(() => {
    resetUserStore();
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("fails fast when there is no subject in the auth payload", async () => {
    vi.mocked(useUpsertUser).mockReturnValue({
      mutateAsync: vi.fn(),
    } as never);
    vi.mocked(accountQueryOptions).mockReturnValue({
      queryKey: ["account"],
      queryFn: vi.fn(),
    } as never);

    const { result } = renderHook(() => useUserSync(), {
      wrapper: createWrapper(),
    });

    await result.current.syncUser(undefined);

    expect(useUserStore.getState().userError).toBe(
      "Missing user subject in auth payload"
    );
  });

  it("upserts the user and loads the account on success", async () => {
    const upsertUser = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useUpsertUser).mockReturnValue({
      mutateAsync: upsertUser,
    } as never);
    const account = buildUser({ username: "ada" });
    vi.mocked(accountQueryOptions).mockReturnValue({
      queryKey: ["account"],
      queryFn: () => Promise.resolve(account),
    } as never);

    const { result } = renderHook(() => useUserSync(), {
      wrapper: createWrapper(),
    });

    await result.current.syncUser("auth0|123");

    expect(upsertUser).toHaveBeenCalledWith({
      sub: "auth0|123",
      tenantId: "stackduel",
    });
    expect(useUserStore.getState().user).toEqual(account);
    expect(useUserStore.getState().userError).toBeNull();
  });

  it("still loads the account when the upsert fails, but surfaces a toast", async () => {
    const upsertUser = vi.fn().mockRejectedValue(new Error("upsert down"));
    vi.mocked(useUpsertUser).mockReturnValue({
      mutateAsync: upsertUser,
    } as never);
    const account = buildUser();
    vi.mocked(accountQueryOptions).mockReturnValue({
      queryKey: ["account"],
      queryFn: () => Promise.resolve(account),
    } as never);

    const { result } = renderHook(() => useUserSync(), {
      wrapper: createWrapper(),
    });

    await result.current.syncUser("auth0|123");

    expect(toast.error).toHaveBeenCalledWith("upsert down");
    expect(useUserStore.getState().user).toEqual(account);
  });

  it("records a load failure when the account fetch fails", async () => {
    vi.mocked(useUpsertUser).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    } as never);
    vi.mocked(accountQueryOptions).mockReturnValue({
      queryKey: ["account"],
      queryFn: () => Promise.reject(new Error("account down")),
    } as never);

    const { result } = renderHook(() => useUserSync(), {
      wrapper: createWrapper(),
    });

    await result.current.syncUser("auth0|123");

    expect(useUserStore.getState().user).toBeNull();
    expect(useUserStore.getState().userError).toBe("account down");
  });

  it("skips the upsert but still loads the account when already synced recently", async () => {
    const upsertUser = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useUpsertUser).mockReturnValue({
      mutateAsync: upsertUser,
    } as never);
    const account = buildUser();
    vi.mocked(accountQueryOptions).mockReturnValue({
      queryKey: ["account"],
      queryFn: () => Promise.resolve(account),
    } as never);

    const { result } = renderHook(() => useUserSync(), {
      wrapper: createWrapper(),
    });

    await result.current.syncUser("auth0|123");
    await result.current.syncUser("auth0|123");

    expect(upsertUser).toHaveBeenCalledTimes(1);
    expect(useUserStore.getState().user).toEqual(account);
  });

  it("force-syncs even when already synced recently", async () => {
    const upsertUser = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useUpsertUser).mockReturnValue({
      mutateAsync: upsertUser,
    } as never);
    vi.mocked(accountQueryOptions).mockReturnValue({
      queryKey: ["account"],
      queryFn: () => Promise.resolve(buildUser()),
    } as never);

    const { result } = renderHook(() => useUserSync(), {
      wrapper: createWrapper(),
    });

    await result.current.syncUser("auth0|123");
    await result.current.syncUser("auth0|123", { force: true });

    expect(upsertUser).toHaveBeenCalledTimes(2);
  });

  it("retrySync re-runs the sync using the auth profile currently in the store", async () => {
    const upsertUser = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useUpsertUser).mockReturnValue({
      mutateAsync: upsertUser,
    } as never);
    vi.mocked(accountQueryOptions).mockReturnValue({
      queryKey: ["account"],
      queryFn: () => Promise.resolve(buildUser()),
    } as never);
    useUserStore.setState({
      authProfile: buildAuthUser({ sub: "auth0|retry" }),
    });

    const { result } = renderHook(() => useUserSync(), {
      wrapper: createWrapper(),
    });

    result.current.retrySync();

    await waitFor(() => {
      expect(upsertUser).toHaveBeenCalledWith({
        sub: "auth0|retry",
        tenantId: "stackduel",
      });
    });
  });

  describe("when the session has expired", () => {
    const realLocation = window.location;

    function stubLocation(pathname: string, search = "") {
      const assign = vi.fn();
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...realLocation, pathname, search, assign },
      });
      return assign;
    }

    afterEach(() => {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: realLocation,
      });
    });

    it("signs the user out instead of recording a sync failure when the upsert is rejected", async () => {
      vi.mocked(useUpsertUser).mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new SessionExpiredError()),
      } as never);
      const accountQueryFn = vi.fn();
      vi.mocked(accountQueryOptions).mockReturnValue({
        queryKey: ["account"],
        queryFn: accountQueryFn,
      } as never);
      useUserStore.setState({ authProfile: buildAuthUser() });

      const { result } = renderHook(() => useUserSync(), {
        wrapper: createWrapper(),
      });

      await result.current.syncUser("auth0|123");

      const state = useUserStore.getState();
      expect(state.isSessionExpired).toBe(true);
      expect(state.authProfile).toBeNull();
      expect(state.userError).toBeNull();
      expect(toast.error).not.toHaveBeenCalled();
      // No point fetching the account over a session that can't be authenticated.
      expect(accountQueryFn).not.toHaveBeenCalled();
    });

    it("signs the user out when the account fetch is rejected", async () => {
      vi.mocked(useUpsertUser).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue(undefined),
      } as never);
      vi.mocked(accountQueryOptions).mockReturnValue({
        queryKey: ["account"],
        queryFn: () => Promise.reject(new SessionExpiredError()),
      } as never);

      const { result } = renderHook(() => useUserSync(), {
        wrapper: createWrapper(),
      });

      await result.current.syncUser("auth0|123");

      const state = useUserStore.getState();
      expect(state.isSessionExpired).toBe(true);
      expect(state.user).toBeNull();
      expect(state.userError).toBeNull();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("prompts with a neutral toast instead of an error, keyed so it can't stack up", async () => {
      stubLocation("/problems/two-sum");
      vi.mocked(useUpsertUser).mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new SessionExpiredError()),
      } as never);
      vi.mocked(accountQueryOptions).mockReturnValue({
        queryKey: ["account"],
        queryFn: vi.fn(),
      } as never);

      const { result } = renderHook(() => useUserSync(), {
        wrapper: createWrapper(),
      });

      await result.current.syncUser("auth0|123");

      expect(toast.info).toHaveBeenCalledWith(
        "Your session expired.",
        expect.objectContaining({
          id: "session-expired",
          description: "Sign in again to pick up where you left off.",
          action: expect.objectContaining({ label: "Sign in" }),
        })
      );
    });

    it("sends the sign-in action back to the page the user was on", async () => {
      const assign = stubLocation("/problems/two-sum", "?tab=tests");
      vi.mocked(useUpsertUser).mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new SessionExpiredError()),
      } as never);
      vi.mocked(accountQueryOptions).mockReturnValue({
        queryKey: ["account"],
        queryFn: vi.fn(),
      } as never);

      const { result } = renderHook(() => useUserSync(), {
        wrapper: createWrapper(),
      });

      await result.current.syncUser("auth0|123");

      const { action } = vi.mocked(toast.info).mock.calls[0][1] as unknown as {
        action: { onClick: () => void };
      };
      action.onClick();

      expect(assign).toHaveBeenCalledWith(
        "/auth/login?returnTo=%2Fproblems%2Ftwo-sum%3Ftab%3Dtests"
      );
    });
  });
});
