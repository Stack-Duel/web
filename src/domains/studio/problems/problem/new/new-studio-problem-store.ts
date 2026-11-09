import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface NewStudioProblemDraft {
  title: string;
  question: string;
  estimatedDifficulty: number;
  timeLimitMs: number;
  memoryLimitMB: number;
  trackId: string | null;
  tags: string[];
}

interface NewStudioProblemActions {
  changeTitle: (title: string) => void;
  changeQuestion: (question: string) => void;
  changeEstimatedDifficulty: (difficulty: number) => void;
  changeTimeLimitMs: (timeLimit: number) => void;
  changeMemoryLimitMB: (memoryLimit: number) => void;
  setTrackId: (trackId: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  clearTags: () => void;
  reset: () => void;
}

type NewStudioProblemState = NewStudioProblemDraft & NewStudioProblemActions;

const initialState: NewStudioProblemDraft = {
  title: "",
  question: "",
  estimatedDifficulty: 500,
  timeLimitMs: 1_000,
  memoryLimitMB: 64,
  trackId: null,
  tags: [],
};

export const useNewStudioProblemStore = create<NewStudioProblemState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        changeTitle: (title) => set({ title }, false, "changeTitle"),
        changeQuestion: (question) =>
          set({ question }, false, "changeQuestion"),
        changeEstimatedDifficulty: (estimatedDifficulty) =>
          set({ estimatedDifficulty }, false, "changeEstimatedDifficulty"),
        changeTimeLimitMs: (timeLimitMs) =>
          set({ timeLimitMs }, false, "changeTimeLimitMs"),
        changeMemoryLimitMB: (memoryLimitMB) =>
          set({ memoryLimitMB }, false, "changeMemoryLimitMB"),
        setTrackId: (trackId) => set({ trackId }, false, "setTrackId"),
        addTag: (tag) =>
          set(
            (state) => ({ tags: [...state.tags, tag] }),
            false,
            "addTag"
          ),
        removeTag: (tag) =>
          set(
            (state) => ({ tags: state.tags.filter((t) => t !== tag) }),
            false,
            "removeTag"
          ),
        clearTags: () => set({ tags: [] }, false, "clearTags"),
        reset: () => set(initialState, false, "reset"),
      }),
      { name: "studio-new-problem-draft" }
    )
  )
);
