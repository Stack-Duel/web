import { describe, expect, it } from "vitest";
import { createProblemSubmissionsFilterStore } from "./problem-submissions-filter-store";
import { SubmissionFilterType } from "../models/submission-filter-type";
import { SubmissionOrderByType } from "../models/submission-order-by-type";

describe("createProblemSubmissionsFilterStore", () => {
  it("defaults to user solutions sorted by newest", () => {
    const store = createProblemSubmissionsFilterStore();

    expect(store.getState().type).toBe(SubmissionFilterType.UserSolutions);
    expect(store.getState().sortBy).toBe(SubmissionOrderByType.Newest);
  });

  it("updates the filter type", () => {
    const store = createProblemSubmissionsFilterStore();

    store.getState().setType(SubmissionFilterType.MySubmissions);

    expect(store.getState().type).toBe(SubmissionFilterType.MySubmissions);
  });

  it("updates the sort order", () => {
    const store = createProblemSubmissionsFilterStore();

    store.getState().setSortBy(SubmissionOrderByType.Oldest);

    expect(store.getState().sortBy).toBe(SubmissionOrderByType.Oldest);
  });

  it("creates independent stores per call", () => {
    const storeA = createProblemSubmissionsFilterStore();
    const storeB = createProblemSubmissionsFilterStore();

    storeA.getState().setType(SubmissionFilterType.MySubmissions);

    expect(storeB.getState().type).toBe(SubmissionFilterType.UserSolutions);
  });
});
