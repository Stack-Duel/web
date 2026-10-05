"use client";

import { useCallback } from "react";
import type { Problem } from "../models/problem";
import { useProblemSetupStore } from "../state/problem-setup-store";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";

/**
 * Loads a new problem into the workspace. Mirrors the old cross-slice coupling
 * where dispatching `ProblemEvents.initializeProblem` was also handled by
 * `workspace-slice`'s extraReducer (clearing `codeVersionId`/`activeSubmissionId`
 * so the next problem-setup load resets the editor).
 */
export function useInitializeProblem() {
  const initializeProblem = useProblemSetupStore((s) => s.initializeProblem);
  const onNewProblem = useWorkspaceStore((s) => s.onNewProblem);

  return useCallback(
    (problem: Problem) => {
      initializeProblem(problem);
      onNewProblem();
    },
    [initializeProblem, onNewProblem]
  );
}

export function useClearProblem() {
  return useProblemSetupStore((s) => s.clearProblem);
}
