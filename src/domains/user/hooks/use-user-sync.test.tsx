import { beforeEach, describe, expect, it, vi } from "vitest";
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

vi.mock("../api/upsert-user", () => ({ useUpsertUser: vi.fn() }));
vi.mock("../api/get-account", () => ({ accountQueryOptions: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

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
      tenantId: "algowars",
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
        tenantId: "algowars",
      });
    });
  });
});
