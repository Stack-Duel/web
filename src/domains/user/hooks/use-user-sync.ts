"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useUpsertUser } from "../api/upsert-user";
import { accountQueryOptions } from "../api/get-account";
import { useUserStore } from "../state/user-store";
import { useTenant } from "@/domains/tenant/state/tenant-store";
import { shouldSyncUser, markUserSynced } from "../lib/user-sync-throttle";
import { SessionExpiredError } from "@/shared/lib/api-error";
import { routerConfig } from "@/shared/router-config";

/**
 * Runs the "sync app-level user profile" flow: PUT /user (upsert, idempotent) then
 * GET /user (account). The PUT is throttled per sub (see user-sync-throttle) since
 * it fires on every AuthBridge mount; `force: true` (used by retrySync) bypasses
 * the throttle. The PUT can fail transiently (e.g. the API cold-starting) without
 * the account itself being missing, so a failed/skipped upsert still falls through
 * to the GET; only if both fail does the sidebar end up with no user to show.
 *
 * An expired session is handled separately from those transient failures: retrying
 * can't fix it, so the store is reset (which flips the UI to signed out) and the
 * user is offered a sign-in link back to the page they were on.
 */
export function useUserSync() {
  const queryClient = useQueryClient();
  const { mutateAsync: upsertUser } = useUpsertUser();
  const userSyncStarted = useUserStore((s) => s.userSyncStarted);
  const userSyncFailed = useUserStore((s) => s.userSyncFailed);
  const userLoaded = useUserStore((s) => s.userLoaded);
  const userLoadFailed = useUserStore((s) => s.userLoadFailed);
  const sessionExpired = useUserStore((s) => s.sessionExpired);
  const tenant = useTenant();

  const handleSessionExpired = useCallback(() => {
    sessionExpired();

    const returnTo = `${window.location.pathname}${window.location.search}`;

    // Deliberately not toast.error and not a redirect: the user may have unsaved
    // editor work on the page, so they choose when to navigate. The id keeps a
    // page full of failing requests to a single toast.
    toast.info("Your session expired.", {
      id: "session-expired",
      description: "Sign in again to pick up where you left off.",
      action: {
        label: "Sign in",
        onClick: () => {
          window.location.assign(routerConfig.authLogIn.execute({ returnTo }));
        },
      },
    });
  }, [sessionExpired]);

  const syncUser = useCallback(
    async (sub: string | undefined, options?: { force?: boolean }) => {
      if (!sub) {
        const message = "Missing user subject in auth payload";
        userSyncFailed(message);
        userLoadFailed(message);
        return;
      }

      userSyncStarted();

      if (options?.force || shouldSyncUser(sub)) {
        try {
          await upsertUser({ sub, tenantId: tenant.id });
          markUserSynced(sub);
        } catch (error) {
          if (error instanceof SessionExpiredError) {
            handleSessionExpired();
            return;
          }

          const message =
            error instanceof Error ? error.message : "Failed to sync user";
          userSyncFailed(message);
          toast.error(message);
        }
      }

      try {
        const account = await queryClient.fetchQuery({
          ...accountQueryOptions({}),
          staleTime: 0,
        });
        userLoaded(account);
      } catch (error) {
        if (error instanceof SessionExpiredError) {
          handleSessionExpired();
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load your profile";
        userLoadFailed(message);
      }
    },
    [
      queryClient,
      upsertUser,
      userSyncStarted,
      userSyncFailed,
      userLoaded,
      userLoadFailed,
      handleSessionExpired,
      tenant.id,
    ]
  );

  const retrySync = useCallback(() => {
    const sub = useUserStore.getState().authProfile?.sub;
    void syncUser(sub, { force: true });
  }, [syncUser]);

  return { syncUser, retrySync };
}
