import { defineQuery } from "@/shared/api/define-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { RequiredProblemLanguage } from "../../models/required-language";

export const getRequiredProblemLanguages = ({ signal }: RequestConfig) =>
  http.get<RequiredProblemLanguage[]>(
    "/api/v1/problem-required-language/admin",
    toAxiosConfig({ signal })
  );

const requiredProblemLanguagesQuery = defineQuery({
  queryKey: () => ["admin-required-problem-languages"],
  queryFn: getRequiredProblemLanguages,
  meta: { errorToast: "Error loading required languages" },
});

export const useRequiredProblemLanguages =
  requiredProblemLanguagesQuery.useQuery;
