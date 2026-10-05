"use client";

import { useForfeitGame as useForfeitGameMutation } from "../api/forfeit-game";

/** Forfeits `gameId`. The mutation invalidates the game query on success. */
export function useForfeitGame(gameId: string | undefined) {
  const mutation = useForfeitGameMutation();

  const forfeit = () => {
    if (!gameId) return;
    mutation.mutate({ gameId });
  };

  return { forfeit, isForfeiting: mutation.isPending };
}
