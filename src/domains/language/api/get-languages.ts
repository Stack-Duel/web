import { toAxiosConfig } from "@/shared/lib/request-config";
import { defineQuery } from "@/shared/api/define-query";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { ProgrammingLanguage } from "../models/programming-language";
import { http } from "@/shared/lib/http";

export const getLanguages = ({ signal }: RequestConfig) =>
  http.get<ProgrammingLanguage[]>(
    "/api/v1/language",
    toAxiosConfig({ signal })
  );

const languagesQuery = defineQuery({
  queryKey: () => ["languages"],
  queryFn: getLanguages,
  meta: { errorToast: "Error loading languages" },
});

export const useLanguages = languagesQuery.useQuery;
export const useSuspenseLanguages = languagesQuery.useSuspenseQuery;
