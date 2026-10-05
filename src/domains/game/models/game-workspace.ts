import { Game } from "./game";

/**
 * Contract every game-mode workspace must implement.
 * PlayGameContent only ever talks to this shape. It has
 * no idea whether it's rendering Solo Rush, Duel, or FFA.
 */
export type GameWorkspaceProps = {
  game: Game;
};
