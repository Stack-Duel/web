/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

export type ApiFnReturnType<FnType extends (...args: any[]) => Promise<any>> =
  Awaited<ReturnType<FnType>>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  "queryKey" | "queryFn"
>;

export type MutationConfig<FnType extends (...args: any[]) => Promise<any>> =
  Omit<
    UseMutationOptions<ApiFnReturnType<FnType>, Error, Parameters<FnType>[0]>,
    "mutationFn"
  >;

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: {
      errorToast?: string;
    };
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
    queryCache: new QueryCache({
      onError: (error, query) => {
        const title = query.meta?.errorToast;
        if (!title) return;
        toast.error(title, { description: error.message });
      },
    }),
  });
}

let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export default function ReactQueryProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
