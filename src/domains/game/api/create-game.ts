import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { GameModeKey } from "../models/game-mode";

export type TrackSelection = {
  trackKey: string;
  languageIds: string[];
};

export type CreateGameRequest = {
  gameModeKey: GameModeKey;
  timeLimitInSeconds: number;
  trackSelections: TrackSelection[];
  skipsEnabled?: boolean;
};

export const createGame = ({
  signal,
  ...body
}: CreateGameRequest & RequestConfig) =>
  http.post<string>("/api/v1/game", body, toAxiosConfig({ signal }));

const createGameMutation = defineMutation<string, CreateGameRequest>({
  mutationFn: createGame,
  invalidateQueries: () => [["open-games"], ["my-active-games"]],
});

export const useCreateGame = createGameMutation.useMutation;
