import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { ProblemSetup } from "../models/problem-setup";

type GetProblemSetupParams = {
  slug: string;
  languageVersionId: string;
};

export const getProblemSetup = ({
  slug,
  languageVersionId,
  signal,
}: GetProblemSetupParams & RequestConfig) =>
  http.get<ProblemSetup>(`/api/v1/problem/${slug}/setup`, {
    ...toAxiosConfig({ signal }),
    params: { languageVersionId },
  });

const problemSetupQuery = defineQuery<ProblemSetup, GetProblemSetupParams>({
  queryKey: ({ slug, languageVersionId }) => [
    "problem-setup",
    slug,
    languageVersionId,
  ],
  queryFn: getProblemSetup,
  meta: { errorToast: "Failed to load problem setup" },
});

export const useProblemSetup = problemSetupQuery.useQuery;
export const problemSetupQueryOptions = problemSetupQuery.queryOptions;
