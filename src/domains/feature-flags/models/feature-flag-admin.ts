export type DecisionEffect = "Allow" | "Deny";

export type FeatureFlagUserOverride = {
  userId: string;
  effect: DecisionEffect;
};

export type FeatureFlagGroupOverride = {
  groupId: string;
  effect: DecisionEffect;
};

export interface FeatureFlagAdmin {
  id: string;
  key: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
  rolloutPercentage: number;
  createdAt: string;
  updatedAt: string;
  userOverrides: FeatureFlagUserOverride[];
  groupOverrides: FeatureFlagGroupOverride[];
}
