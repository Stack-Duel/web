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
  /** Set after a problem is solved. `string` = next problem ID ready to load;
   *  `null` = last problem solved, game over. `undefined` = not yet solved. */
  pendingNextProblemId: string | null | undefined;

  viewingProblemId: string | null;

  /** Newest first. Populated purely from SignalR pushes ("GameParticipantAttempted",
   *  "GameParticipantReacted"). There's no REST endpoint backing this, so it starts empty on
   *  every fresh page load/navigation. */
  feed: GameFeedEntry[];

  problemSolved: (nextProblemId: string | null) => void;
  nextProblemLoading: () => void;
  viewProblem: (problemId: string) => void;
  returnToCurrentProblem: () => void;
  addFeedEntry: (entry: GameFeedEntry) => void;
  reset: () => void;
}

export const useGameSessionStore = create<GameSessionState>((set) => ({
  pendingNextProblemId: undefined,
  viewingProblemId: null,
  feed: [],

  problemSolved: (nextProblemId) =>
    set({ pendingNextProblemId: nextProblemId }),

  nextProblemLoading: () =>
    set({ pendingNextProblemId: undefined, viewingProblemId: null }),

  viewProblem: (problemId) => set({ viewingProblemId: problemId }),

  returnToCurrentProblem: () => set({ viewingProblemId: null }),

  addFeedEntry: (entry) =>
    set((state) => ({
      feed: [entry, ...state.feed].slice(0, MAX_FEED_ENTRIES),
    })),

  reset: () =>
    set({ pendingNextProblemId: undefined, viewingProblemId: null, feed: [] }),
}));

export const selectPendingNextProblemId = (s: GameSessionState) =>
  s.pendingNextProblemId;

export const selectViewingProblemId = (s: GameSessionState) =>
  s.viewingProblemId;

export const selectFeed = (s: GameSessionState) => s.feed;
