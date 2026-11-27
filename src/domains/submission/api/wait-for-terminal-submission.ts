import type { QueryClient } from "@tanstack/react-query";
import {
  connectSubmissionHub,
  onSubmissionCompletedPush,
} from "@/shared/lib/signalr/submission-hub-client";
import {
  getSubmissionStatus,
  submissionStatusQueryKey,
  isTerminalSubmissionStatus,
} from "./get-submission-status";
import type { SubmissionStatusDto } from "../models/submission-status";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const TERMINAL_WAIT_TIMEOUT_MS = 60_000;

const POLL_INTERVAL_MS = 2_000;

export type TerminalSubmissionOutcome =
  | { kind: "terminal"; submission: SubmissionStatusDto }
  | { kind: "stillGrading"; submission: SubmissionStatusDto | null };

export async function waitForTerminalSubmission(
  queryClient: QueryClient,
  submissionId: string
): Promise<TerminalSubmissionOutcome> {
  let pushSeen = false;
  let resolvePush: (() => void) | null = null;

  const pushArrived = new Promise<void>((resolve) => {
    resolvePush = resolve;
  });

  const unsubscribe = onSubmissionCompletedPush(({ submissionId: id }) => {
    if (id !== submissionId) return;
    pushSeen = true;
    resolvePush?.();
  });

  const fetchStatus = async (): Promise<SubmissionStatusDto | null> => {
    try {
      return await queryClient.fetchQuery({
        queryKey: submissionStatusQueryKey(submissionId),
        queryFn: ({ signal }) => getSubmissionStatus({ submissionId, signal }),
        staleTime: 0,
      });
    } catch {
      return null;
    }
  };

  const waitForNextCheck = () =>
    pushSeen
      ? delay(POLL_INTERVAL_MS)
      : Promise.race([pushArrived, delay(POLL_INTERVAL_MS)]);

  try {
    void connectSubmissionHub().catch(() => {});

    const deadline = Date.now() + TERMINAL_WAIT_TIMEOUT_MS;
    let latest: SubmissionStatusDto | null = null;

    for (;;) {
      await waitForNextCheck();

      latest = await fetchStatus();

      if (latest && isTerminalSubmissionStatus(latest.status)) {
        return { kind: "terminal", submission: latest };
      }

      if (Date.now() >= deadline) {
        return { kind: "stillGrading", submission: latest };
      }
    }
  } finally {
    unsubscribe();
  }
}
