import { createHubClient } from "@/shared/lib/signalr/create-hub-client";

/**
 * Payload the server pushes on the "SubmissionCompleted" hub method. Treated as a
 * "go re-fetch" signal. The submission's actual results are read back from the REST API.
 */
export type SubmissionCompletedPush = {
  submissionId: string;
};

const SUBMISSION_COMPLETED_EVENT = "SubmissionCompleted";

const hub = createHubClient("/hubs/submission");

/**
 * Connects to the submission hub if not already connected. Call before subscribing
 * to submission-completed pushes. Safe to call multiple times: returns immediately
 * when already connected.
 */
export const connectSubmissionHub = async (): Promise<void> => {
  await hub.ensureConnected();
};

/**
 * Subscribes to submission-completed pushes for the current user. Returns an
 * unsubscribe function. Safe to call before the connection is started: handlers
 * persist across reconnects.
 */
export const onSubmissionCompletedPush = (
  handler: (payload: SubmissionCompletedPush) => void
): (() => void) => {
  const connection = hub.getConnectionWithoutStarting();
  connection.on(SUBMISSION_COMPLETED_EVENT, handler);
  return () => connection.off(SUBMISSION_COMPLETED_EVENT, handler);
};
