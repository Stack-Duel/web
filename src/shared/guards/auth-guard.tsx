"use client";

import { type ReactNode } from "react";
import {
  selectIsAuthenticated,
  selectIsFullyLoaded,
  selectUserPermissions,
  useUserStore,
} from "@/domains/user/state/user-store";
import type { Permission } from "@/shared/lib/permissions";
import { AuthGuardFallback } from "./auth-guard-fallback";
import { useHasMounted } from "../hooks/use-has-mounted";

type AuthGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  permission?: Permission | Permission[];
  requireAll?: boolean;
};

export function AuthGuard({
  children,
  fallback,
  loadingFallback = null,
  permission,
  requireAll = true,
}: Readonly<AuthGuardProps>) {
  const hasMounted = useHasMounted();
  const isAuthenticated = useUserStore(selectIsAuthenticated);
  const isFullyLoaded = useUserStore(selectIsFullyLoaded);
  const userPermissions = useUserStore(selectUserPermissions);

  if (!hasMounted || !isFullyLoaded) {
    return <>{loadingFallback}</>;
  }

  if (!isAuthenticated) {
    return (
      <>
        {fallback !== undefined ? (
          fallback
        ) : (
          <AuthGuardFallback reason="unauthenticated" />
        )}
      </>
    );
  }

  if (permission) {
    const required = Array.isArray(permission) ? permission : [permission];
    const hasPermission = requireAll
      ? required.every((p) => userPermissions.includes(p))
      : required.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return (
        <>
          {fallback !== undefined ? (
            fallback
          ) : (
            <AuthGuardFallback reason="forbidden" />
          )}
        </>
      );
    }
  }

  return <>{children}</>;
}
