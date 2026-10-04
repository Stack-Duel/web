"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { routerConfig } from "@/shared/router-config";
import {
  useUserStore,
  selectIsAuthenticated,
} from "@/domains/user/state/user-store";
import { useAccount } from "@/domains/user/api/get-account";
import { SetupBannerContent } from "@/domains/user/components/setup-banner";
import { BANNER_HEIGHT } from "./top-banner-styles";

/**
 * Global top-of-page banner slot, rendered in AppProviders, outside every page's own
 * SidebarLayout, so it sits at the very top of the page (full width, above the sidebar chrome).
 *
 * Owns the single `--active-banner-offset` CSS variable the fixed sidebar reads (see
 * shared/components/ui/sidebar.tsx).
 */
export default function TopBanner() {
  const pathname = usePathname();
  const isAuthenticated = useUserStore(selectIsAuthenticated);

  const { data: account } = useAccount({
    queryConfig: { enabled: isAuthenticated },
  });

  const needsSetup = isAuthenticated && !!account && !account.setupCompletedAt;
  const isSetupBannerHiddenOnThisRoute =
    pathname === routerConfig.userSetup.path;
  const isVisible = needsSetup && !isSetupBannerHiddenOnThisRoute;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--active-banner-offset",
      isVisible ? BANNER_HEIGHT : "0px"
    );
    return () => {
      document.documentElement.style.setProperty(
        "--active-banner-offset",
        "0px"
      );
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return <SetupBannerContent />;
}
