import { beforeEach, describe, expect, it } from "vitest";
import {
  selectAvatarUrl,
  selectDisplayName,
  selectHasError,
  selectIsAuthenticated,
  selectIsFullyLoaded,
  selectUserEmail,
  selectUserPermissions,
  selectUserRoles,
  selectUserStatus,
  selectUserSyncFailed,
  useUserStore,
} from "./user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";

describe("useUserStore actions", () => {
  beforeEach(() => {
    resetUserStore();
  });

  it("starts in a signed-out, non-loading state", () => {
    const state = useUserStore.getState();

    expect(state.authProfile).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthLoading).toBe(false);
    expect(state.isUserLoading).toBe(false);
    expect(state.authError).toBeNull();
    expect(state.userError).toBeNull();
  });

  it("authCheckStarted marks auth as loading and clears the auth error", () => {
    useUserStore.setState({ authError: "previous error" });

    useUserStore.getState().authCheckStarted();

    expect(useUserStore.getState().isAuthLoading).toBe(true);
    expect(useUserStore.getState().authError).toBeNull();
  });

  it("userAuthenticated stores the auth profile and clears loading/error", () => {
    const authProfile = buildAuthUser();
    useUserStore.setState({ isAuthLoading: true, authError: "failed" });

    useUserStore.getState().userAuthenticated(authProfile);

    const state = useUserStore.getState();
    expect(state.authProfile).toBe(authProfile);
    expect(state.isAuthLoading).toBe(false);
    expect(state.authError).toBeNull();
  });

  it("userUnauthenticated clears the auth profile and user", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser(),
      isAuthLoading: true,
    });

    useUserStore.getState().userUnauthenticated();

    const state = useUserStore.getState();
    expect(state.authProfile).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthLoading).toBe(false);
  });

  it("authCheckFailed records the error and stops loading", () => {
    useUserStore.getState().authCheckFailed("network error");

    const state = useUserStore.getState();
    expect(state.authError).toBe("network error");
    expect(state.isAuthLoading).toBe(false);
  });

  it("sessionExpired resets the whole store", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser(),
      isAuthLoading: true,
      isUserLoading: true,
      authError: "err",
      userError: "err",
    });

    useUserStore.getState().sessionExpired();

    const state = useUserStore.getState();
    expect(state.authProfile).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthLoading).toBe(false);
    expect(state.isUserLoading).toBe(false);
    expect(state.authError).toBeNull();
    expect(state.userError).toBeNull();
  });

  it("userSyncStarted marks the user as loading and clears the user error", () => {
    useUserStore.setState({ userError: "previous error" });

    useUserStore.getState().userSyncStarted();

    expect(useUserStore.getState().isUserLoading).toBe(true);
    expect(useUserStore.getState().userError).toBeNull();
  });

  it("userSyncFailed records the error and stops loading", () => {
    useUserStore.getState().userSyncFailed("sync failed");

    const state = useUserStore.getState();
    expect(state.userError).toBe("sync failed");
    expect(state.isUserLoading).toBe(false);
  });

  it("userLoaded stores the user and clears loading/error", () => {
    const user = buildUser();
    useUserStore.setState({ isUserLoading: true, userError: "failed" });

    useUserStore.getState().userLoaded(user);

    const state = useUserStore.getState();
    expect(state.user).toBe(user);
    expect(state.isUserLoading).toBe(false);
    expect(state.userError).toBeNull();
  });

  it("userLoadFailed records the error and stops loading", () => {
    useUserStore.getState().userLoadFailed("load failed");

    const state = useUserStore.getState();
    expect(state.userError).toBe("load failed");
    expect(state.isUserLoading).toBe(false);
  });

  it("loggedOut resets the whole store", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser(),
    });

    useUserStore.getState().loggedOut();

    const state = useUserStore.getState();
    expect(state.authProfile).toBeNull();
    expect(state.user).toBeNull();
  });
});

describe("useUserStore selectors", () => {
  beforeEach(() => {
    resetUserStore();
  });

  it("selectUserRoles/selectUserPermissions return a stable empty array when there is no user", () => {
    const roles1 = selectUserRoles(useUserStore.getState());
    const roles2 = selectUserRoles(useUserStore.getState());
    const permissions1 = selectUserPermissions(useUserStore.getState());

    expect(roles1).toEqual([]);
    expect(roles1).toBe(roles2);
    expect(permissions1).toEqual([]);
  });

  it("selectUserRoles/selectUserPermissions read from the loaded user", () => {
    useUserStore.setState({
      user: buildUser({ roles: ["admin"], permissions: ["user:read:admin"] }),
    });

    expect(selectUserRoles(useUserStore.getState())).toEqual(["admin"]);
    expect(selectUserPermissions(useUserStore.getState())).toEqual([
      "user:read:admin",
    ]);
  });

  it("selectIsAuthenticated reflects whether an auth profile is present", () => {
    expect(selectIsAuthenticated(useUserStore.getState())).toBe(false);

    useUserStore.setState({ authProfile: buildAuthUser() });

    expect(selectIsAuthenticated(useUserStore.getState())).toBe(true);
  });

  it("selectIsFullyLoaded is false while either auth or user is loading", () => {
    useUserStore.setState({ isAuthLoading: true, isUserLoading: false });
    expect(selectIsFullyLoaded(useUserStore.getState())).toBe(false);

    useUserStore.setState({ isAuthLoading: false, isUserLoading: true });
    expect(selectIsFullyLoaded(useUserStore.getState())).toBe(false);

    useUserStore.setState({ isAuthLoading: false, isUserLoading: false });
    expect(selectIsFullyLoaded(useUserStore.getState())).toBe(true);
  });

  it("selectHasError is true when either error is set", () => {
    expect(selectHasError(useUserStore.getState())).toBe(false);

    useUserStore.setState({ authError: "oops" });
    expect(selectHasError(useUserStore.getState())).toBe(true);
  });

  it("selectUserSyncFailed is only true when the user failed to load with no user present", () => {
    expect(selectUserSyncFailed(useUserStore.getState())).toBe(false);

    useUserStore.setState({ userError: "failed" });
    expect(selectUserSyncFailed(useUserStore.getState())).toBe(true);

    useUserStore.setState({ user: buildUser() });
    expect(selectUserSyncFailed(useUserStore.getState())).toBe(false);
  });

  it("selectDisplayName prefers the app username, then auth name, then auth email", () => {
    expect(selectDisplayName(useUserStore.getState())).toBe("Anonymous");

    useUserStore.setState({
      authProfile: buildAuthUser({ name: undefined, email: "a@b.com" }),
    });
    expect(selectDisplayName(useUserStore.getState())).toBe("a@b.com");

    useUserStore.setState({
      authProfile: buildAuthUser({ name: "Ada Lovelace" }),
    });
    expect(selectDisplayName(useUserStore.getState())).toBe("Ada Lovelace");

    useUserStore.setState({ user: buildUser({ username: "ada" }) });
    expect(selectDisplayName(useUserStore.getState())).toBe("ada");
  });

  it("selectAvatarUrl falls back to a gravatar computed from the auth profile email", () => {
    expect(selectAvatarUrl(useUserStore.getState())).toBeNull();

    useUserStore.setState({
      authProfile: buildAuthUser({ email: "ada@example.com" }),
    });

    expect(selectAvatarUrl(useUserStore.getState())).toBe(
      "https://www.gravatar.com/avatar/3e3417d7ef77d5932a6734b916515ed5?d=identicon&s=200"
    );
  });

  it("selectAvatarUrl prefers the app user's own imageUrl over gravatar", () => {
    useUserStore.setState({
      authProfile: buildAuthUser({ email: "ada@example.com" }),
      user: buildUser({ imageUrl: "https://example.com/avatar.png" }),
    });

    expect(selectAvatarUrl(useUserStore.getState())).toBe(
      "https://example.com/avatar.png"
    );
  });

  it("selectUserEmail reads from the auth profile", () => {
    expect(selectUserEmail(useUserStore.getState())).toBeNull();

    useUserStore.setState({
      authProfile: buildAuthUser({ email: "ada@example.com" }),
    });

    expect(selectUserEmail(useUserStore.getState())).toBe("ada@example.com");
  });

  it("selectUserStatus combines the loading flags and the first available error", () => {
    useUserStore.setState({ isAuthLoading: true, userError: "user failed" });

    expect(selectUserStatus(useUserStore.getState())).toEqual({
      isLoading: true,
      error: "user failed",
    });
  });
});
