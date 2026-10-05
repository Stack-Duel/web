"use client";

import { GameStatus } from "../../models/game";
import type { GameWorkspaceProps } from "../../models/game-workspace";
import { useGameCountdown } from "../../hooks/use-game-countdown";
import RampWorkspace from "../../ramp/components/ramp-workspace";
import LobbyWorkspace from "./lobby-workspace";
import GameStartingModal from "./game-starting-modal";

export default function MultiplayerWorkspace({
  game,
}: Readonly<GameWorkspaceProps>) {
  const { isCountingDown, secondsRemaining } = useGameCountdown(game);

  if (game.status === GameStatus.Pending) {
    return <LobbyWorkspace game={game} />;
  }

  if (isCountingDown) {
    return (
      <GameStartingModal game={game} secondsRemaining={secondsRemaining} />
    );
  }

  return <RampWorkspace game={game} />;
}
