import { create } from "zustand";
import type { User as AuthUser } from "@auth0/nextjs-auth0/types";
import { getGravatarUrl } from "@/shared/lib/gravatar";
import type { User } from "../models/user";

interface UserState {
  authProfile: AuthUser | null;
  user: User | null;

  isAuthLoading: boolean;
  isUserLoading: boolean;

  /**
   * True once the Auth0 session can no longer produce an access token (expired or
   * revoked refresh token). The session cookie is still readable at that point, so
   * getSession() keeps handing AuthBridge a user; this flag is what lets the UI tell
   * "signed in" apart from "holding a dead cookie".
   */
  isSessionExpired: boolean;

  authError: string | null;
  userError: string | null;

  authCheckStarted: () => void;
  userAuthenticated: (user: AuthUser) => void;
  userUnauthenticated: () => void;
  authCheckFailed: (message: string) => void;
  sessionExpired: () => void;

  userSyncStarted: () => void;
  userSyncFailed: (message: string) => void;

  userLoaded: (user: User) => void;
  userLoadFailed: (message: string) => void;

  loggedOut: () => void;
}

const initialState = {
  authProfile: null,
  user: null,
  isAuthLoading: false,
  isUserLoading: false,
  isSessionExpired: false,
  authError: null,
  userError: null,
} satisfies Partial<UserState>;

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  authCheckStarted: () => set({ isAuthLoading: true, authError: null }),

  userAuthenticated: (user) =>
    set({
      authProfile: user,
      isAuthLoading: false,
      authError: null,
      isSessionExpired: false,
    }),

  userUnauthenticated: () =>
    set({ authProfile: null, user: null, isAuthLoading: false }),

  authCheckFailed: (message) =>
    set({ authError: message, isAuthLoading: false }),

  sessionExpired: () => set({ ...initialState, isSessionExpired: true }),

  userSyncStarted: () => set({ isUserLoading: true, userError: null }),

  userSyncFailed: (message) =>
    set({ isUserLoading: false, userError: message }),

  userLoaded: (user) => set({ user, isUserLoading: false, userError: null }),

  userLoadFailed: (message) =>
    set({ userError: message, isUserLoading: false }),

  loggedOut: () => set(initialState),
}));

const EMPTY_ROLES: string[] = [];
const EMPTY_PERMISSIONS: string[] = [];

export const selectAuthProfile = (s: UserState) => s.authProfile;
export const selectUser = (s: UserState) => s.user;
export const selectUserRoles = (s: UserState) => s.user?.roles ?? EMPTY_ROLES;
export const selectUserPermissions = (s: UserState) =>
  s.user?.permissions ?? EMPTY_PERMISSIONS;
export const selectIsAuthLoading = (s: UserState) => s.isAuthLoading;
export const selectIsUserLoading = (s: UserState) => s.isUserLoading;
export const selectIsSessionExpired = (s: UserState) => s.isSessionExpired;
export const selectAuthError = (s: UserState) => s.authError;
export const selectUserError = (s: UserState) => s.userError;

export const selectIsAuthenticated = (s: UserState): boolean =>
  s.authProfile !== null;

export const selectIsFullyLoaded = (s: UserState): boolean =>
  !s.isAuthLoading && !s.isUserLoading;

export const selectHasError = (s: UserState): boolean =>
  s.authError !== null || s.userError !== null;

export const selectUserSyncFailed = (s: UserState): boolean =>
  s.userError !== null && s.user === null;

export const selectDisplayName = (s: UserState): string =>
  s.user?.username ??
  s.authProfile?.name ??
  s.authProfile?.email ??
  "Anonymous";

export const selectAvatarUrl = (s: UserState): string | null =>
  s.user?.imageUrl ??
  (s.authProfile?.email ? getGravatarUrl(s.authProfile.email) : null);

export const selectUserEmail = (s: UserState): string | null =>
  s.authProfile?.email ?? null;

export const selectUserStatus = (s: UserState) => ({
  isLoading: s.isAuthLoading || s.isUserLoading,
  error: s.authError ?? s.userError ?? null,
});
