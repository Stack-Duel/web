import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type AddRequiredProblemLanguageVariables = {
  languageVersionId: string;
};

export const addRequiredProblemLanguage = ({
  languageVersionId,
  signal,
}: AddRequiredProblemLanguageVariables & RequestConfig) =>
  http.post<string>(
    "/api/v1/problem-required-language/admin",
    { languageVersionId },
    toAxiosConfig({ signal })
  );

const addRequiredProblemLanguageMutation = defineMutation<
  string,
  AddRequiredProblemLanguageVariables
>({
  mutationFn: addRequiredProblemLanguage,
  invalidateQueries: () => [["admin-required-problem-languages"]],
});

export const useAddRequiredProblemLanguage =
  addRequiredProblemLanguageMutation.useMutation;
