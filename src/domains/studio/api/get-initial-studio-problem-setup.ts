import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import { InitialStudioProblemSetup } from "../models/initial-studio-problem-setup";

export const getInitialStudioProblemSetup = ({ signal }: RequestConfig) =>
  http.get<InitialStudioProblemSetup>(
    "/api/v1/studio/problems/initial-values",
    toAxiosConfig({ signal })
  );

const initialStudioProblemSetupQuery = defineQuery({
  queryKey: () => ["studio-problems", "initial-values"],
  queryFn: getInitialStudioProblemSetup,
  meta: { errorToast: "Error loading studio setup" },
});

export const useInitialStudioProblemSetup =
  initialStudioProblemSetupQuery.useQuery;
export const useSuspenseInitialStudioProblemSetup =
  initialStudioProblemSetupQuery.useSuspenseQuery;
