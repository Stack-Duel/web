import { GameStatus } from "./game";
import { GameModeKey } from "./game-mode";

export interface MyActiveGame {
  gameId: string;
  gameModeKey: GameModeKey;
  gameModeName: string;
  status: GameStatus;
  timeLimitInSeconds: number;
  createdAt: Date;
  startedAt?: Date;
  participantCount: number;
  maxPlayers: number;
  isHost: boolean;
  hostUsername: string;
  techStacks: string[];
}
