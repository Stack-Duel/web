export const FeatureFlags = {
  LEADERBOARDS: "leaderboards",
  RATINGS: "ratings",
} as const;

export type FeatureFlagKey = (typeof FeatureFlags)[keyof typeof FeatureFlags];
