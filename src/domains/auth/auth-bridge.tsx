"use client";

import { useEffect } from "react";
import type { SessionData } from "@auth0/nextjs-auth0/types";
import { useUserStore } from "@/domains/user/state/user-store";
import { useUserSync } from "@/domains/user/hooks/use-user-sync";

type Auth0BridgeProps = {
  session: SessionData | null;
};

export function AuthBridge({ session }: Readonly<Auth0BridgeProps>) {
  const authCheckStarted = useUserStore((s) => s.authCheckStarted);
  const userAuthenticated = useUserStore((s) => s.userAuthenticated);
  const userUnauthenticated = useUserStore((s) => s.userUnauthenticated);
  const { syncUser } = useUserSync();
  const user = session?.user;

  useEffect(() => {
    authCheckStarted();
  }, [authCheckStarted]);

  useEffect(() => {
    if (user) {
      userAuthenticated(user);
      void syncUser(user.sub);
    } else {
      userUnauthenticated();
    }
  }, [syncUser, user, user?.sub, userAuthenticated, userUnauthenticated]);

  return null;
}
