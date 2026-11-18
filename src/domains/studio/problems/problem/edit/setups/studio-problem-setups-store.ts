import { createStore } from "zustand/vanilla";
import type { StudioProblemSetup } from "@/domains/studio/models/studio-problem-setup";

export interface StudioProblemSetupDraft {
  starterCode: string;
  functionName: string;
  referenceSolution: string;
}

type SetupDraftsByLanguageVersionId = Record<string, StudioProblemSetupDraft>;

export interface StudioProblemSetupsState {
  drafts: SetupDraftsByLanguageVersionId;
  saved: SetupDraftsByLanguageVersionId;
  syncSetupsFromServer: (setups: StudioProblemSetup[]) => void;
  changeStarterCode: (languageVersionId: string, starterCode: string) => void;
  changeFunctionName: (languageVersionId: string, functionName: string) => void;
  changeReferenceSolution: (
    languageVersionId: string,
    referenceSolution: string
  ) => void;
  markSetupSaved: (languageVersionId: string) => void;
  revertSetup: (languageVersionId: string) => void;
}

export function toSetupDraft(
  setup: StudioProblemSetup
): StudioProblemSetupDraft {
  return {
    starterCode: setup.starterCode,
    functionName: setup.functionName ?? "",
    referenceSolution: setup.referenceSolution ?? "",
  };
}

function toDraftsByLanguageVersionId(
  setups: StudioProblemSetup[]
): SetupDraftsByLanguageVersionId {
  return Object.fromEntries(
    setups.map((setup) => [setup.languageVersionId, toSetupDraft(setup)])
  );
}

export const createStudioProblemSetupsStore = (setups: StudioProblemSetup[]) =>
  createStore<StudioProblemSetupsState>((set) => {
    const changeField = (
      languageVersionId: string,
      patch: Partial<StudioProblemSetupDraft>
    ) =>
      set((state) => {
        const current = state.drafts[languageVersionId];
        if (!current) return state;

        return {
          drafts: {
            ...state.drafts,
            [languageVersionId]: { ...current, ...patch },
          },
        };
      });

    return {
      drafts: toDraftsByLanguageVersionId(setups),
      saved: toDraftsByLanguageVersionId(setups),

      syncSetupsFromServer: (serverSetups) =>
        set((state) => {
          const drafts = { ...state.drafts };
          const saved = { ...state.saved };

          for (const setup of serverSetups) {
            const serverDraft = toSetupDraft(setup);
            saved[setup.languageVersionId] = serverDraft;
            drafts[setup.languageVersionId] ??= serverDraft;
          }

          return { drafts, saved };
        }),

      changeStarterCode: (languageVersionId, starterCode) =>
        changeField(languageVersionId, { starterCode }),

      changeFunctionName: (languageVersionId, functionName) =>
        changeField(languageVersionId, { functionName }),

      changeReferenceSolution: (languageVersionId, referenceSolution) =>
        changeField(languageVersionId, { referenceSolution }),

      markSetupSaved: (languageVersionId) =>
        set((state) => {
          const draft = state.drafts[languageVersionId];
          if (!draft) return state;

          return { saved: { ...state.saved, [languageVersionId]: draft } };
        }),

      revertSetup: (languageVersionId) =>
        set((state) => {
          const saved = state.saved[languageVersionId];
          if (!saved) return state;

          return { drafts: { ...state.drafts, [languageVersionId]: saved } };
        }),
    };
  });

export const selectSetupField =
  (languageVersionId: string, field: keyof StudioProblemSetupDraft) =>
  (state: StudioProblemSetupsState) =>
    state.drafts[languageVersionId]?.[field];

export const selectSetupDraft =
  (languageVersionId: string) => (state: StudioProblemSetupsState) =>
    state.drafts[languageVersionId];

export const selectSetupIsDirty =
  (languageVersionId: string) => (state: StudioProblemSetupsState) => {
    const draft = state.drafts[languageVersionId];
    const saved = state.saved[languageVersionId];

    if (!draft || !saved) return false;

    return (
      draft.starterCode !== saved.starterCode ||
      draft.functionName !== saved.functionName ||
      draft.referenceSolution !== saved.referenceSolution
    );
  };

export const selectHasAnyDirtySetup = (state: StudioProblemSetupsState) =>
  Object.keys(state.drafts).some((languageVersionId) =>
    selectSetupIsDirty(languageVersionId)(state)
  );
