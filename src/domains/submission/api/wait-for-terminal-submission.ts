import type { QueryClient } from "@tanstack/react-query";
import {
  connectSubmissionHub,
  onSubmissionCompletedPush,
} from "@/shared/lib/signalr/submission-hub-client";
import {
  getSubmissionStatus,
  submissionStatusQueryKey,
} from "./get-submission-status";
import type { SubmissionStatusDto } from "../models/submission-status";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Waits for `submissionId` to reach a terminal state, then returns its status.
 *
 * Subscribes to the SignalR "SubmissionCompleted" push and races it against a
 * 60-second timeout (in case the hub is unavailable or the push is missed),
 * then does one forced, uncached fetch of the submission's status regardless
 * of which won the race. Shared between the general run/submit flow and any
 * feature (like a game mode) that needs to synchronously know the outcome of
 * a submission rather than just observing it via `useSubmissionStatus`.
 */
export async function waitForTerminalSubmission(
  queryClient: QueryClient,
  submissionId: string
): Promise<SubmissionStatusDto> {
  let unsubscribe = () => {};

  try {
    await connectSubmissionHub();
    const pushArrived = new Promise<void>((resolve) => {
      unsubscribe = onSubmissionCompletedPush(({ submissionId: id }) => {
        if (id === submissionId) resolve();
      });
    });
    await Promise.race([pushArrived, delay(60_000)]);
  } catch {
    // Hub unavailable: fall through and fetch anyway.
  } finally {
    unsubscribe();
  }

  return queryClient.fetchQuery({
    queryKey: submissionStatusQueryKey(submissionId),
    queryFn: ({ signal }) => getSubmissionStatus({ submissionId, signal }),
    staleTime: 0,
  });
}
