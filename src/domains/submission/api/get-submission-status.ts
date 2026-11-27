import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import {
  connectSubmissionHub,
  onSubmissionCompletedPush,
} from "@/shared/lib/signalr/submission-hub-client";
import type {
  SubmissionStatus,
  SubmissionStatusDto,
} from "../models/submission-status";

export const getSubmissionStatus = ({
  submissionId,
  signal,
}: {
  submissionId: string;
  signal?: AbortSignal;
}) =>
  http.get<SubmissionStatusDto>(
    `/api/v1/submission/${submissionId}`,
    toAxiosConfig({ signal })
  );

export const submissionStatusQueryKey = (submissionId: string) => [
  "submission-status",
  submissionId,
];

const terminalSubmissionStatuses = new Set<SubmissionStatus>([
  "Accepted",
  "WrongAnswer",
]);

export const isTerminalSubmissionStatus = (status: SubmissionStatus) =>
  terminalSubmissionStatuses.has(status);

const isPendingSubmissionStatus = (status: SubmissionStatus) =>
  !isTerminalSubmissionStatus(status);

export function useSubmissionStatus(submissionId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: submissionStatusQueryKey(submissionId ?? ""),
    queryFn: ({ signal }) =>
      getSubmissionStatus({ submissionId: submissionId as string, signal }),
    enabled: !!submissionId,
    refetchOnMount: "always",
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || isPendingSubmissionStatus(data.status)) {
        return 10_000;
      }
      return false;
    },
    meta: { errorToast: "Failed to load submission status" },
  });

  const status = query.data?.status;
  const isPending = !status || isPendingSubmissionStatus(status);
  const isPendingRef = useRef(isPending);
  // eslint-disable-next-line react-hooks/refs
  isPendingRef.current = isPending;

  useEffect(() => {
    if (!submissionId || !isPending) return;

    const unsubscribe = onSubmissionCompletedPush(({ submissionId: id }) => {
      if (id !== submissionId || !isPendingRef.current) return;

      queryClient.invalidateQueries({
        queryKey: submissionStatusQueryKey(submissionId),
      });
    });

    void connectSubmissionHub().catch(() => {});

    return unsubscribe;
  }, [submissionId, isPending, queryClient]);

  return query;
}
