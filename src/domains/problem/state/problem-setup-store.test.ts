import { beforeEach, describe, expect, it } from "vitest";
import {
  selectCurrentProblem,
  useProblemSetupStore,
} from "./problem-setup-store";
import { buildProblem } from "@/test/factories/problem";

describe("useProblemSetupStore", () => {
  beforeEach(() => {
    useProblemSetupStore.setState({ currentProblem: null });
  });

  it("starts with no current problem", () => {
    expect(useProblemSetupStore.getState().currentProblem).toBeNull();
  });

  it("sets the current problem on initializeProblem", () => {
    const problem = buildProblem();

    useProblemSetupStore.getState().initializeProblem(problem);

    expect(useProblemSetupStore.getState().currentProblem).toEqual(problem);
    expect(selectCurrentProblem(useProblemSetupStore.getState())).toEqual(
      problem
    );
  });

  it("clears the current problem on clearProblem", () => {
    useProblemSetupStore.getState().initializeProblem(buildProblem());

    useProblemSetupStore.getState().clearProblem();

    expect(useProblemSetupStore.getState().currentProblem).toBeNull();
  });
});
