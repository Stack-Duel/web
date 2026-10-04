export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  imageUrl: string | null;
  highScore: number;
  isCurrentUser: boolean;
}
