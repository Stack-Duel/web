import { create } from "zustand";
import type { Problem } from "../models/problem";

interface ProblemSetupState {
  currentProblem: Problem | null;

  initializeProblem: (problem: Problem) => void;
  clearProblem: () => void;
}

export const useProblemSetupStore = create<ProblemSetupState>((set) => ({
  currentProblem: null,

  initializeProblem: (problem) => set({ currentProblem: problem }),
  clearProblem: () => set({ currentProblem: null }),
}));

export const selectCurrentProblem = (s: ProblemSetupState) => s.currentProblem;
