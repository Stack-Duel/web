import { GameModeKey } from "./game-mode";

export interface GameLobbySummary {
  gameId: string;
  gameModeKey: GameModeKey;
  gameModeName: string;
  timeLimitInSeconds: number;
  createdAt: Date;
  minPlayers: number;
  maxPlayers: number;
  participantCount: number;
  hostUsername: string;
  isHost: boolean;
  isParticipant: boolean;
  techStacks: string[];
}
