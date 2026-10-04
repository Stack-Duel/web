"use client";

import { GameStatus } from "../../models/game";
import type { GameWorkspaceProps } from "../../models/game-workspace";
import { useGameCountdown } from "../../hooks/use-game-countdown";
import RampWorkspaceHeader from "../../ramp/components/ramp-workspace-header";

export default function MultiplayerWorkspaceHeader({
  game,
}: Readonly<GameWorkspaceProps>) {
  const { isCountingDown } = useGameCountdown(game);

  if (game.status !== GameStatus.Running || isCountingDown) {
    return null;
  }

  return <RampWorkspaceHeader game={game} />;
}
