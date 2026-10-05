import { useEffect, useState } from "react";
import { Game, GameStatus } from "../models/game";

const TICK_MS = 200;

function computeSecondsRemaining(startedAtMs: number): number {
  return Math.max(Math.ceil((startedAtMs - Date.now()) / 1000), 0);
}

export function useGameCountdown(game: Game | undefined) {
  const startedAtMs =
    game?.status === GameStatus.Running && game.startedAt
      ? new Date(game.startedAt).getTime()
      : null;

  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!startedAtMs) return;

    const tick = () =>
      setSecondsRemaining(computeSecondsRemaining(startedAtMs));
    tick();
    const id = setInterval(tick, TICK_MS);

    return () => {
      clearInterval(id);
      setSecondsRemaining(0);
    };
  }, [startedAtMs]);

  return {
    isCountingDown: secondsRemaining > 0,
    secondsRemaining,
  };
}
