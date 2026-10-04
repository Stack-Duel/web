import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type JoinGameByCodeVariables = { joinCode: string };

export const joinGameByCode = ({
  joinCode,
  signal,
}: JoinGameByCodeVariables & RequestConfig) =>
  http.post<string>(
    "/api/v1/game/join-by-code",
    { joinCode },
    toAxiosConfig({ signal })
  );

const joinGameByCodeMutation = defineMutation<string, JoinGameByCodeVariables>({
  mutationFn: joinGameByCode,
  invalidateQueries: () => [["open-games"], ["my-active-games"]],
});

export const useJoinGameByCode = joinGameByCodeMutation.useMutation;
