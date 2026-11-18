import { describe, expect, it } from "vitest";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";
import {
  createStudioProblemEditStore,
  selectHasVisibleErrors,
  selectIsDirty,
  selectRequiresLimitConfirmation,
  selectTitleError,
} from "./studio-problem-edit-store";

const longEnoughQuestion = "q".repeat(60);

function createStore(
  overrides: Partial<ReturnType<typeof buildStudioProblemDetails>> = {}
) {
  return createStudioProblemEditStore(
    buildStudioProblemDetails({
      title: "Two Sum",
      question: longEnoughQuestion,
      difficultyValue: 800,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      tags: ["arrays"],
      ...overrides,
    })
  );
}

describe("createStudioProblemEditStore", () => {
  it("initializes the draft from the loaded problem details", () => {
    const store = createStore();

    expect(store.getState().draft).toEqual({
      title: "Two Sum",
      question: longEnoughQuestion,
      estimatedDifficulty: 800,
      timeLimitMs: 2000,
      memoryLimitMB: 256,
      tags: ["arrays"],
    });
  });

  it("is not dirty until a field actually changes", () => {
    const store = createStore();

    expect(selectIsDirty(store.getState())).toBe(false);

    store.getState().changeTitle("Three Sum");

    expect(selectIsDirty(store.getState())).toBe(true);
  });

  it("hides field errors until the field has been touched", () => {
    const store = createStore();

    store.getState().changeTitle("ab");

    expect(selectTitleError(store.getState())).toBeUndefined();

    store.getState().touchField("title");

    expect(selectTitleError(store.getState())).toBe(
      "Title must be at least 3 characters"
    );
  });

  it("reports failure and surfaces every error when validating the whole draft", () => {
    const store = createStore();

    store.getState().changeTitle("ab");
    store.getState().changeQuestion("too short");

    expect(store.getState().validateDraft()).toBe(false);
    expect(selectHasVisibleErrors(store.getState())).toBe(true);
  });

  it("validates a draft that satisfies every field rule", () => {
    const store = createStore();

    store.getState().changeTitle("Three Sum");

    expect(store.getState().validateDraft()).toBe(true);
    expect(selectHasVisibleErrors(store.getState())).toBe(false);
  });

  it("restores the saved values when changes are discarded", () => {
    const store = createStore();

    store.getState().changeTitle("Three Sum");
    store.getState().revertToSaved();

    expect(store.getState().draft.title).toBe("Two Sum");
    expect(selectIsDirty(store.getState())).toBe(false);
  });

  it("treats the current draft as the new baseline once saved", () => {
    const store = createStore();

    store.getState().changeTitle("Three Sum");
    store.getState().markDraftSaved();

    expect(selectIsDirty(store.getState())).toBe(false);

    store.getState().revertToSaved();

    expect(store.getState().draft.title).toBe("Three Sum");
  });

  it("requires confirmation when a published problem has its limits changed", () => {
    const store = createStore({ status: "Published" });

    store.getState().changeTitle("Three Sum");
    expect(selectRequiresLimitConfirmation(store.getState())).toBe(false);

    store.getState().changeTimeLimitMs(400);
    expect(selectRequiresLimitConfirmation(store.getState())).toBe(true);
  });

  it("does not require confirmation for limit changes on a draft problem", () => {
    const store = createStore({ status: "Draft" });

    store.getState().changeTimeLimitMs(400);

    expect(selectRequiresLimitConfirmation(store.getState())).toBe(false);
  });
});
