import { GameMode, GameModeKey } from "@/domains/game/models/game-mode";

export const dashboardSoloRushMode: GameMode = {
  id: GameModeKey.SoloRush,
  key: GameModeKey.SoloRush,
  name: "Solo Rush",
  description:
    "Race against the clock solving algorithmic problems solo. Problems start easy and get progressively harder as you go.",
  minPlayers: 1,
  maxPlayers: 1,
  timeOptions: [
    { durationSeconds: 300, isDefault: false },
    { durationSeconds: 600, isDefault: true },
    { durationSeconds: 900, isDefault: false },
    { durationSeconds: 1800, isDefault: false },
  ],
};

export const dashboardDuelMode: GameMode = {
  id: GameModeKey.Duel,
  key: GameModeKey.Duel,
  name: "Duel",
  description: "Challenge your opponent in a one-on-one, head-to-head battle.",
  minPlayers: 2,
  maxPlayers: 2,
  timeOptions: [
    { durationSeconds: 300, isDefault: false },
    { durationSeconds: 600, isDefault: true },
    { durationSeconds: 900, isDefault: false },
  ],
};

export const dashboardFfaMode: GameMode = {
  id: GameModeKey.Ffa,
  key: GameModeKey.Ffa,
  name: "FFA",
  description:
    "Free-for-all: solve as many problems as possible before the time runs out.",
  minPlayers: 2,
  maxPlayers: 10,
  timeOptions: [
    { durationSeconds: 300, isDefault: false },
    { durationSeconds: 600, isDefault: true },
    { durationSeconds: 900, isDefault: false },
    { durationSeconds: 1800, isDefault: false },
  ],
};
