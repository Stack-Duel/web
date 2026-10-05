"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { gameQueryOptions } from "../api/get-game";

/** Invalidates the game query so a running timer hitting zero refetches state. */
export function useGameTimeExpired(gameId: string) {
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: gameQueryOptions({ gameId }).queryKey,
    });
  }, [queryClient, gameId]);
}
