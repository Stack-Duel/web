import { createStore } from "zustand/vanilla";
import type { StudioProblemDetails } from "@/domains/studio/models/studio-problem-details";
import {
  studioProblemEditSchema,
  validateStudioProblemEditField,
  type StudioProblemEditField,
  type StudioProblemEditValues,
} from "./studio-problem-edit-schema";

export const EDITABLE_FIELDS = Object.keys(
  studioProblemEditSchema.shape
) as StudioProblemEditField[];

type FieldFlags = Partial<Record<StudioProblemEditField, boolean>>;
type FieldErrors = Partial<Record<StudioProblemEditField, string>>;

export interface StudioProblemEditState {
  draft: StudioProblemEditValues;
  savedDraft: StudioProblemEditValues;
  touchedFields: FieldFlags;
  fieldErrors: FieldErrors;
  problemStatus: StudioProblemDetails["status"];
  attemptCount: number;
  changeTitle: (title: string) => void;
  changeQuestion: (question: string) => void;
  changeEstimatedDifficulty: (estimatedDifficulty: number) => void;
  changeTimeLimitMs: (timeLimitMs: number) => void;
  changeMemoryLimitMB: (memoryLimitMB: number) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  replaceDraft: (draft: StudioProblemEditValues) => void;
  touchField: (field: StudioProblemEditField) => void;
  validateDraft: () => boolean;
  revertToSaved: () => void;
  markDraftSaved: () => void;
}

export function toStudioProblemEditValues(
  details: StudioProblemDetails
): StudioProblemEditValues {
  return {
    title: details.title,
    question: details.question,
    estimatedDifficulty: details.difficultyValue,
    timeLimitMs: details.timeLimitMs,
    memoryLimitMB: details.memoryLimitMb,
    tags: details.tags ?? [],
  };
}

export const createStudioProblemEditStore = (details: StudioProblemDetails) =>
  createStore<StudioProblemEditState>((set, get) => {
    const initialValues = toStudioProblemEditValues(details);

    const changeField = <TField extends StudioProblemEditField>(
      field: TField,
      value: StudioProblemEditValues[TField]
    ) =>
      set((state) => ({
        draft: { ...state.draft, [field]: value },
        fieldErrors: {
          ...state.fieldErrors,
          [field]: validateStudioProblemEditField(field, value),
        },
      }));

    return {
      draft: initialValues,
      savedDraft: initialValues,
      touchedFields: {},
      fieldErrors: {},
      problemStatus: details.status,
      attemptCount: details.attemptCount,

      changeTitle: (title) => changeField("title", title),

      changeQuestion: (question) => changeField("question", question),

      changeEstimatedDifficulty: (estimatedDifficulty) =>
        changeField("estimatedDifficulty", estimatedDifficulty),

      changeTimeLimitMs: (timeLimitMs) =>
        changeField("timeLimitMs", timeLimitMs),

      changeMemoryLimitMB: (memoryLimitMB) =>
        changeField("memoryLimitMB", memoryLimitMB),

      addTag: (tag) => {
        const { tags } = get().draft;
        if (!tag || tags.includes(tag)) return;
        changeField("tags", [...tags, tag]);
      },

      removeTag: (tag) =>
        changeField(
          "tags",
          get().draft.tags.filter((existing) => existing !== tag)
        ),

      replaceDraft: (draft) => set({ draft, fieldErrors: {} }),

      touchField: (field) =>
        set((state) => ({
          touchedFields: { ...state.touchedFields, [field]: true },
        })),

      validateDraft: () => {
        const result = studioProblemEditSchema.safeParse(get().draft);
        const fieldErrors: FieldErrors = {};

        if (!result.success) {
          for (const issue of result.error.issues) {
            const field = issue.path[0] as StudioProblemEditField;
            fieldErrors[field] ??= issue.message;
          }
        }

        set({
          fieldErrors,
          touchedFields: Object.fromEntries(
            EDITABLE_FIELDS.map((field) => [field, true])
          ),
        });

        return result.success;
      },

      revertToSaved: () =>
        set((state) => ({
          draft: state.savedDraft,
          touchedFields: {},
          fieldErrors: {},
        })),

      markDraftSaved: () =>
        set((state) => ({
          savedDraft: state.draft,
          touchedFields: {},
        })),
    };
  });

const visibleError = (
  state: StudioProblemEditState,
  field: StudioProblemEditField
) => (state.touchedFields[field] ? state.fieldErrors[field] : undefined);

export const selectTitle = (state: StudioProblemEditState) => state.draft.title;

export const selectTitleError = (state: StudioProblemEditState) =>
  visibleError(state, "title");

export const selectQuestion = (state: StudioProblemEditState) =>
  state.draft.question;

export const selectQuestionError = (state: StudioProblemEditState) =>
  visibleError(state, "question");

export const selectEstimatedDifficulty = (state: StudioProblemEditState) =>
  state.draft.estimatedDifficulty;

export const selectEstimatedDifficultyError = (state: StudioProblemEditState) =>
  visibleError(state, "estimatedDifficulty");

export const selectTimeLimitMs = (state: StudioProblemEditState) =>
  state.draft.timeLimitMs;

export const selectTimeLimitMsError = (state: StudioProblemEditState) =>
  visibleError(state, "timeLimitMs");

export const selectMemoryLimitMB = (state: StudioProblemEditState) =>
  state.draft.memoryLimitMB;

export const selectMemoryLimitMBError = (state: StudioProblemEditState) =>
  visibleError(state, "memoryLimitMB");

const isFieldDirty = (
  state: StudioProblemEditState,
  field: StudioProblemEditField
) => {
  const draft = state.draft[field];
  const saved = state.savedDraft[field];

  if (Array.isArray(draft) && Array.isArray(saved)) {
    return (
      draft.length !== saved.length ||
      draft.some((value, index) => value !== saved[index])
    );
  }

  return draft !== saved;
};

export const selectIsDirty = (state: StudioProblemEditState) =>
  EDITABLE_FIELDS.some((field) => isFieldDirty(state, field));

export const selectUnsavedFieldCount = (state: StudioProblemEditState) =>
  EDITABLE_FIELDS.filter((field) => isFieldDirty(state, field)).length;

export const selectTags = (state: StudioProblemEditState) => state.draft.tags;

export const selectTagsError = (state: StudioProblemEditState) =>
  visibleError(state, "tags");

export const selectFirstVisibleError = (state: StudioProblemEditState) => {
  for (const field of EDITABLE_FIELDS) {
    const error = visibleError(state, field);
    if (error) return error;
  }

  return undefined;
};

export const selectHasVisibleErrors = (state: StudioProblemEditState) =>
  EDITABLE_FIELDS.some((field) => visibleError(state, field) !== undefined);

export const selectHasLimitChanges = (state: StudioProblemEditState) =>
  state.draft.timeLimitMs !== state.savedDraft.timeLimitMs ||
  state.draft.memoryLimitMB !== state.savedDraft.memoryLimitMB;

export const selectRequiresLimitConfirmation = (
  state: StudioProblemEditState
) => state.problemStatus === "Published" && selectHasLimitChanges(state);
