import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { AuthBridge } from "./auth-bridge";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildSessionData } from "@/test/factories/session";
import { buildAuthUser } from "@/test/factories/auth-user";
import { syncUserMock } from "@/test/mocks/use-user-sync";

vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);

describe("AuthBridge", () => {
  beforeEach(() => {
    resetUserStore();
    syncUserMock.mockClear();
  });

  it("marks the user authenticated and syncs their profile when a session is present", () => {
    const session = buildSessionData({
      user: buildAuthUser({ sub: "auth0|session-user" }),
    });

    render(<AuthBridge session={session} />);

    expect(useUserStore.getState().authProfile).toEqual(session.user);
    expect(syncUserMock).toHaveBeenCalledWith("auth0|session-user");
  });

  it("marks the user unauthenticated and does not sync when there is no session", () => {
    render(<AuthBridge session={null} />);

    expect(useUserStore.getState().authProfile).toBeNull();
    expect(useUserStore.getState().user).toBeNull();
    expect(syncUserMock).not.toHaveBeenCalled();
  });

  it("re-syncs when the session user changes", () => {
    const firstSession = buildSessionData({
      user: buildAuthUser({ sub: "auth0|first" }),
    });
    const { rerender } = render(<AuthBridge session={firstSession} />);
    expect(syncUserMock).toHaveBeenCalledWith("auth0|first");

    const secondSession = buildSessionData({
      user: buildAuthUser({ sub: "auth0|second" }),
    });
    rerender(<AuthBridge session={secondSession} />);

    expect(syncUserMock).toHaveBeenCalledWith("auth0|second");
    expect(useUserStore.getState().authProfile).toEqual(secondSession.user);
  });

  it("does not re-sync when the session object is new but the user is the same", () => {
    const firstSession = buildSessionData({
      user: buildAuthUser({ sub: "auth0|same" }),
    });
    const { rerender } = render(<AuthBridge session={firstSession} />);
    expect(syncUserMock).toHaveBeenCalledTimes(1);

    const sameUserNewSessionObject = buildSessionData({
      user: buildAuthUser({ sub: "auth0|same" }),
    });
    rerender(<AuthBridge session={sameUserNewSessionObject} />);

    expect(syncUserMock).toHaveBeenCalledTimes(1);
  });
});
