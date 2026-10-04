"use client";

import {
  QueryMeta,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { QueryConfig } from "@/shared/lib/react-query";

type DefineQueryArgs<TData, TParams extends object> = {
  queryKey: (params: TParams) => readonly unknown[];
  queryFn: (params: TParams & RequestConfig) => Promise<TData>;
  meta?: QueryMeta;
};

export function defineQuery<
  TData,
  TParams extends object = Record<never, never>,
>({ queryKey, queryFn, meta }: DefineQueryArgs<TData, TParams>) {
  const buildQueryOptions = (params: TParams) =>
    queryOptions({
      queryKey: queryKey(params),
      queryFn: ({ signal }) => queryFn({ ...params, signal }),
      meta,
    });

  type UseResourceParams = TParams & {
    queryConfig?: QueryConfig<typeof buildQueryOptions>;
  };

  type UseResourceArgs = keyof TParams extends never
    ? [params?: UseResourceParams]
    : [params: UseResourceParams];

  function useResource(...args: UseResourceArgs) {
    const { queryConfig, ...rest } = (args[0] ?? {}) as UseResourceParams;
    const restParams = rest as TParams;

    return useQuery({
      ...buildQueryOptions(restParams),
      ...queryConfig,
    });
  }

  function useSuspenseResource(...args: UseResourceArgs) {
    const { queryConfig, ...rest } = (args[0] ?? {}) as UseResourceParams;
    const restParams = rest as TParams;

    return useSuspenseQuery({
      ...buildQueryOptions(restParams),
      ...queryConfig,
    });
  }

  return {
    queryOptions: buildQueryOptions,
    useQuery: useResource,
    useSuspenseQuery: useSuspenseResource,
  };
}
