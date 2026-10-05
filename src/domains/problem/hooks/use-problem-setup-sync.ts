"use client";

import { useEffect } from "react";
import { useProblemSetup } from "../api/get-problem-setup";
import {
  useProblemSetupStore,
  selectCurrentProblem,
} from "../state/problem-setup-store";
import {
  useWorkspaceStore,
  selectSelectedVersionId,
} from "@/domains/workspace/state/workspace-store";

/**
 * Fetches the setup (starter code, etc.) for the current problem + selected
 * language version, and syncs it into the workspace store. Replaces the
 * `initializeProblem` / `selectedVersionChanged` listener effects that used to
 * dispatch `loadProblemSetupRequested`/`Success`/`Failure`.
 *
 * Safe to mount from more than one component for the same problem. React
 * Query dedupes the network request by query key, and the sync into the
 * workspace store is idempotent (a no-op once the version already matches).
 */
export function useProblemSetupSync() {
  const currentProblem = useProblemSetupStore(selectCurrentProblem);
  const selectedVersionId = useWorkspaceStore(selectSelectedVersionId);
  const onProblemSetupLoaded = useWorkspaceStore((s) => s.onProblemSetupLoaded);

  const slug = currentProblem?.slug;
  const enabled = !!slug && !!selectedVersionId;

  const query = useProblemSetup({
    slug: slug ?? "",
    languageVersionId: selectedVersionId ?? "",
    queryConfig: { enabled },
  });

  useEffect(() => {
    if (query.data && selectedVersionId) {
      onProblemSetupLoaded(query.data, selectedVersionId);
    }
  }, [query.data, selectedVersionId, onProblemSetupLoaded]);

  return {
    setup: query.data ?? null,
    isLoading: enabled && query.isLoading,
    error: query.error?.message ?? null,
  };
}
