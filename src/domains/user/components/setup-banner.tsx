"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, UserRoundCog } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { routerConfig } from "@/shared/router-config";
import {
  bannerClassName,
  ctaClassName,
} from "@/shared/components/top-banner-styles";

/**
 * Content for the "finish setting up your account" banner. Rendered by TopBanner
 * (shared/components/top-banner.tsx), which decides visibility (an incomplete setup loses to an
 * active-game banner) and owns the shared banner offset CSS variable.
 */
export function SetupBannerContent() {
  const router = useRouter();

  return (
    <div className={bannerClassName}>
      <UserRoundCog size={16} className="shrink-0 text-white/70" />
      <span className="truncate font-medium">
        Finish setting up your account
      </span>
      <div className="ml-auto shrink-0">
        <Button
          size="sm"
          onClick={() => router.push(routerConfig.userSetup.path)}
          className={ctaClassName}
        >
          Complete setup
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
