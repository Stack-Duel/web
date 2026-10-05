import { createStore } from "zustand/vanilla";
import { SubmissionFilterType } from "../models/submission-filter-type";
import { SubmissionOrderByType } from "../models/submission-order-by-type";

export interface ProblemSubmissionsFilterState {
  type: SubmissionFilterType;
  sortBy: SubmissionOrderByType;
  setType: (type: SubmissionFilterType) => void;
  setSortBy: (sortBy: SubmissionOrderByType) => void;
}

export const createProblemSubmissionsFilterStore = () =>
  createStore<ProblemSubmissionsFilterState>((set) => ({
    type: SubmissionFilterType.UserSolutions,
    sortBy: SubmissionOrderByType.Newest,
    setType: (type) => set({ type }),
    setSortBy: (sortBy) => set({ sortBy }),
  }));
