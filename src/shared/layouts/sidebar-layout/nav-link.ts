import type { ComponentType } from "react";
import type { Permission } from "@/shared/lib/permissions";
import type { FeatureFlagKey } from "@/domains/feature-flags/lib/well-known-features";

export type NavIcon = ComponentType<{ className?: string; size?: number }>;

export type AccessContext = {
  permissions: Set<string>;
  flags: Partial<Record<FeatureFlagKey, boolean>>;
};

export type NavLink = {
  title: string;
  url?: string;
  icon?: NavIcon;
  isActive?: boolean;
  external?: boolean;
  permission?: Permission | Permission[];
  requireAllPermissions?: Permission[];
  featureFlag?: FeatureFlagKey;
  isVisible?: (ctx: AccessContext) => boolean;
  items?: NavLink[];
};
