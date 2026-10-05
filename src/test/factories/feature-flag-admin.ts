import type { FeatureFlagAdmin } from "@/domains/feature-flags/models/feature-flag-admin";

export function buildFeatureFlagAdmin(
  overrides: Partial<FeatureFlagAdmin> = {}
): FeatureFlagAdmin {
  return {
    id: "flag_1",
    key: "leaderboards",
    name: "Leaderboards",
    description: "Global kill-switch for the leaderboards page and endpoint.",
    defaultEnabled: true,
    rolloutPercentage: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    userOverrides: [],
    groupOverrides: [],
    ...overrides,
  };
}
