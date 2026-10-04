"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateGame } from "../api/create-game";
import type { TrackSelection } from "../api/create-game";
import { routerConfig } from "@/shared/router-config";
import { GameModeKey } from "../models/game-mode";

export function useCreateGameAndPlay() {
  const router = useRouter();
  const mutation = useCreateGame();

  const createGame = (args: {
    gameModeKey: GameModeKey;
    timeLimitInSeconds: number;
    trackSelections: TrackSelection[];
  }) => {
    mutation.mutate(args, {
      onSuccess: (gameId) => {
        router.push(routerConfig.gamePlay.execute({ gameId }));
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create game");
      },
    });
  };

  return { createGame, isCreating: mutation.isPending };
}
