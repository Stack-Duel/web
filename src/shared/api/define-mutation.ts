"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { MutationConfig } from "@/shared/lib/react-query";

type DefineMutationArgs<TData, TVariables extends object> = {
  mutationFn: (variables: TVariables & RequestConfig) => Promise<TData>;
  invalidateQueries?: (
    data: TData,
    variables: TVariables
  ) => readonly (readonly unknown[])[];
};

export function defineMutation<TData, TVariables extends object>({
  mutationFn,
  invalidateQueries,
}: DefineMutationArgs<TData, TVariables>) {
  type OnSuccessArgs = Parameters<
    NonNullable<UseMutationOptions<TData, Error, TVariables>["onSuccess"]>
  >;

  function useResourceMutation(options?: {
    mutationConfig?: MutationConfig<typeof mutationFn>;
  }) {
    const queryClient = useQueryClient();
    const { onSuccess, ...restConfig } = options?.mutationConfig ?? {};

    return useMutation<TData, Error, TVariables>({
      mutationFn: (variables) => {
        const abortController = new AbortController();
        return mutationFn({
          ...variables,
          signal: abortController.signal,
        });
      },
      onSuccess: (...args: OnSuccessArgs) => {
        const [data, variables] = args;
        invalidateQueries?.(data, variables).forEach((queryKey) =>
          queryClient.invalidateQueries({ queryKey: queryKey as unknown[] })
        );
        (onSuccess as ((...args: OnSuccessArgs) => void) | undefined)?.(
          ...args
        );
      },
      ...(restConfig as Omit<
        UseMutationOptions<TData, Error, TVariables>,
        "mutationFn" | "onSuccess"
      >),
    });
  }

  return { useMutation: useResourceMutation };
}
