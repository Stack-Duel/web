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

/**
 * A live, chat-like feed of things that happen during a Running game: currently submission
 * attempts and quick emoji reactions. Deliberately a discriminated union on `type` rather than
 * separate lists: adding a future entry kind (e.g. a real chat message) is a new union member plus
 * a new case in whatever renders the feed, not a parallel data structure.
 */
export type GameFeedEntry = GameFeedAttemptEntry | GameFeedReactionEntry;

/** Live feed is capped rather than unbounded. It's a "what just happened" view, not a durable
 *  record (the History tab already covers that per-player). */
const MAX_FEED_ENTRIES = 50;

interface GameSessionState {
  /** True once the current problem is solved and the player has not moved on yet. */
  hasSolvedCurrentProblem: boolean;

  /** The next problem ready to load, or `null` when the solve was the last one. */
  nextProblemId: string | null;

  viewingProblemId: string | null;

  /** The problem ID whose submission is currently out for grading, or `null` when nothing is in flight. */
  gradingProblemId: string | null;

  /** Newest first. Populated purely from SignalR pushes ("GameParticipantAttempted",
   *  "GameParticipantReacted"). There's no REST endpoint backing this, so it starts empty on
   *  every fresh page load/navigation. */
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
    set((state) => ({
      feed: [entry, ...state.feed].slice(0, MAX_FEED_ENTRIES),
    })),

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
