import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

type CreateProblemPoolVariables = {
  key: string;
  name: string;
  description?: string;
};

export const createProblemPool = ({
  key,
  name,
  description,
  signal,
}: CreateProblemPoolVariables & RequestConfig) =>
  http.post<string>(
    "/api/v1/problempool",
    { key, name, description },
    toAxiosConfig({ signal })
  );

const createProblemPoolMutation = defineMutation<
  string,
  CreateProblemPoolVariables
>({
  mutationFn: createProblemPool,
  invalidateQueries: () => [["problem-pools"]],
});

export const useCreateProblemPool = createProblemPoolMutation.useMutation;
