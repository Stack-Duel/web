import { defineMutation } from "@/shared/api/define-mutation";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";

export type RemoveRequiredProblemLanguageVariables = {
  id: string;
};

export const removeRequiredProblemLanguage = ({
  id,
  signal,
}: RemoveRequiredProblemLanguageVariables & RequestConfig) =>
  http.delete<void>(
    `/api/v1/problem-required-language/admin/${id}`,
    toAxiosConfig({ signal })
  );

const removeRequiredProblemLanguageMutation = defineMutation<
  void,
  RemoveRequiredProblemLanguageVariables
>({
  mutationFn: removeRequiredProblemLanguage,
  invalidateQueries: () => [["admin-required-problem-languages"]],
});

export const useRemoveRequiredProblemLanguage =
  removeRequiredProblemLanguageMutation.useMutation;
