import { ComponentType } from "react";
import { GameModeKey } from "./models/game-mode";
import { GameWorkspaceProps } from "./models/game-workspace";
import RampWorkspace from "./ramp/components/ramp-workspace";
import RampWorkspaceHeader from "./ramp/components/ramp-workspace-header";
import GameOverSummary from "./ramp/components/game-over-summary";
import MultiplayerWorkspace from "./lobby/components/multiplayer-workspace";
import MultiplayerWorkspaceHeader from "./lobby/components/multiplayer-workspace-header";

/**
 * A mode's full strategy: the required workspace, plus an
 * optional header. Not every mode needs a header: omit it
 * and PlayGameContent just won't render one.
 */
type GameWorkspaceStrategy = {
  Workspace: ComponentType<GameWorkspaceProps>;
  Header?: ComponentType<GameWorkspaceProps>;
  GameOverSummary?: ComponentType<GameWorkspaceProps>;
};

/**
 * Strategy registry: one entry per game mode. Partial<> because a mode's
 * strategy only needs to exist once someone's building it. PlayGameContent
 * falls back gracefully when a key isn't registered.
 *
 * The actual "solve problems that get harder as you go" gameplay
 * (RampWorkspace/RampWorkspaceHeader/GameOverSummary, under ./ramp) is
 * shared: every mode's strategy calls into it rather than owning its own
 * copy, since one player's loop is identical whether they're alone (Solo
 * Rush) or one of several participants racing on their own independent
 * problem track (Duel, FFA). Duel/FFA's strategy additionally composes the
 * lobby phase (./lobby) in front of it, since those modes wait for players
 * before starting; Solo Rush skips straight to Ramp*.
 *
 * To add a new mode that reuses the same gameplay: register Ramp* directly
 * (like Solo Rush), or wrap it the way Duel/FFA do if the mode needs its own
 * pre-game phase. A mode with genuinely different gameplay gets its own
 * strategy instead. PlayGameContent never needs to change either way.
 */
export const gameWorkspaceRegistry: Partial<
  Record<GameModeKey, GameWorkspaceStrategy>
> = {
  [GameModeKey.SoloRush]: {
    Workspace: RampWorkspace,
    Header: RampWorkspaceHeader,
    GameOverSummary,
  },
  [GameModeKey.Duel]: {
    Workspace: MultiplayerWorkspace,
    Header: MultiplayerWorkspaceHeader,
    GameOverSummary,
  },
  [GameModeKey.Ffa]: {
    Workspace: MultiplayerWorkspace,
    Header: MultiplayerWorkspaceHeader,
    GameOverSummary,
  },
};
