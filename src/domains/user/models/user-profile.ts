import type { SubmissionStatus } from "@/domains/submission/models/submission-status";

export interface GameModeStat {
  gameModeKey: string;
  gameModeName: string;
  hasOpponents: boolean;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  bestScore: number;
}

export interface ProfileGameParticipant {
  username: string;
  imageUrl: string | null;
  score: number;
}

export interface ProfileGame {
  gameId: string;
  gameModeKey: string;
  gameModeName: string;
  endedAt: string | null;
  participants: ProfileGameParticipant[];
}

export interface ProfileSubmission {
  id: string;
  status: SubmissionStatus;
  problemTitle: string;
  problemSlug: string;
  language: {
    id: string;
    name: string;
    version: string;
  };
  createdAt: string;
}

export interface SubmissionCalendarDay {
  date: string;
  count: number;
}

export interface UserProfile {
  id: string;
  username: string;
  bio: string | null;
  imageUrl: string | null;
  createdAt: string;
  isPrivate: boolean;
  isOwnProfile: boolean;
  gameModeStats: GameModeStat[] | null;
  recentGames: ProfileGame[] | null;
  recentSubmissions: ProfileSubmission[] | null;
  // Sparse: only days with at least one submission. Pair with the range
  // fields below to reconstruct the full contiguous grid for rendering.
  submissionCalendar: SubmissionCalendarDay[] | null;
  submissionCalendarRangeStart: string | null;
  submissionCalendarRangeEnd: string | null;
}

export interface UserGameStats {
  id: string;
  username: string;
  isOwnProfile: boolean;
  gameModeStats: GameModeStat[] | null;
}
