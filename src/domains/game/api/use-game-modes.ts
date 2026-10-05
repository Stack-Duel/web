import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { GameMode } from "../models/game-mode";

export const getGameModes = ({ signal }: RequestConfig) =>
  http.get<GameMode[]>("/api/v1/game/modes", toAxiosConfig({ signal }));

const gameModesQuery = defineQuery({
  queryKey: () => ["game-modes"],
  queryFn: getGameModes,
  meta: { errorToast: "Error loading game modes" },
});

export const useGameModes = gameModesQuery.useQuery;
