import { useFeatureFlags } from "../api/get-feature-flags";

export function useFeatureFlag(key: string): boolean {
  const { data } = useFeatureFlags();
  return data?.[key] ?? false;
}
