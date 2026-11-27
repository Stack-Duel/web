import { create } from "zustand";
import type { SubmissionStatus } from "@/domains/submission/models/submission-status";

type GameFeedEntryBase = {
  id: string;
  userId: string;
  createdAt: string;
};

export type GameFeedAttemptEntry = GameFeedEntryBase & {
  type: "attempt";
  status: SubmissionStatus;
};

export type GameFeedReactionEntry = GameFeedEntryBase & {
  type: "reaction";
  emoji: string;
};

export type GameFeedEntry = GameFeedAttemptEntry | GameFeedReactionEntry;

const MAX_FEED_ENTRIES = 50;

interface GameSessionState {
  hasSolvedCurrentProblem: boolean;

  nextProblemId: string | null;

  viewingProblemId: string | null;

  gradingProblemId: string | null;

  feed: GameFeedEntry[];

  problemSolved: (nextProblemId: string | null) => void;
  nextProblemLoading: () => void;
  viewProblem: (problemId: string) => void;
  returnToCurrentProblem: () => void;
  addFeedEntry: (entry: GameFeedEntry) => void;
  gradingStarted: (problemId: string) => void;
  gradingSettled: () => void;
  reset: () => void;
}

export const useGameSessionStore = create<GameSessionState>((set) => ({
  hasSolvedCurrentProblem: false,
  nextProblemId: null,
  viewingProblemId: null,
  gradingProblemId: null,
  feed: [],

  problemSolved: (nextProblemId) =>
    set({ hasSolvedCurrentProblem: true, nextProblemId }),

  nextProblemLoading: () =>
    set({
      hasSolvedCurrentProblem: false,
      nextProblemId: null,
      viewingProblemId: null,
    }),

  viewProblem: (problemId) => set({ viewingProblemId: problemId }),

  returnToCurrentProblem: () => set({ viewingProblemId: null }),

  addFeedEntry: (entry) =>
    set((state) => {
      if (state.feed.some((existing) => existing.id === entry.id)) {
        return state;
      }

      const feed = [entry, ...state.feed]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, MAX_FEED_ENTRIES);

      return { feed };
    }),

  gradingStarted: (problemId) => set({ gradingProblemId: problemId }),

  gradingSettled: () => set({ gradingProblemId: null }),

  reset: () =>
    set({
      hasSolvedCurrentProblem: false,
      nextProblemId: null,
      viewingProblemId: null,
      gradingProblemId: null,
      feed: [],
    }),
}));

export const selectHasSolvedCurrentProblem = (s: GameSessionState) =>
  s.hasSolvedCurrentProblem;

export const selectNextProblemId = (s: GameSessionState) => s.nextProblemId;

export const selectViewingProblemId = (s: GameSessionState) =>
  s.viewingProblemId;

export const selectGradingProblemId = (s: GameSessionState) =>
  s.gradingProblemId;

export const selectFeed = (s: GameSessionState) => s.feed;
