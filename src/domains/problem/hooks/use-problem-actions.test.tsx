import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useClearProblem, useInitializeProblem } from "./use-problem-actions";
import { useProblemSetupStore } from "../state/problem-setup-store";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import { buildProblem } from "@/test/factories/problem";

describe("useInitializeProblem", () => {
  beforeEach(() => {
    useProblemSetupStore.setState({ currentProblem: null });
    useWorkspaceStore.getState().reset();
  });

  it("sets the current problem and clears workspace state for a new problem", () => {
    useWorkspaceStore.setState({
      codeVersionId: "lang_1",
      activeSubmissionId: "submission_1",
      customTestCases: [{ inputs: ["1"] }],
    });
    const { result } = renderHook(() => useInitializeProblem());
    const problem = buildProblem();

    result.current(problem);

    expect(useProblemSetupStore.getState().currentProblem).toEqual(problem);
    expect(useWorkspaceStore.getState().codeVersionId).toBeNull();
    expect(useWorkspaceStore.getState().activeSubmissionId).toBeNull();
    expect(useWorkspaceStore.getState().customTestCases).toEqual([]);
  });
});

describe("useClearProblem", () => {
  beforeEach(() => {
    useProblemSetupStore.setState({ currentProblem: buildProblem() });
  });

  it("clears the current problem when called", () => {
    const { result } = renderHook(() => useClearProblem());

    result.current();

    expect(useProblemSetupStore.getState().currentProblem).toBeNull();
  });
});
