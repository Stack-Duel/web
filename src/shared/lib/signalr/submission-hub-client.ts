import { createHubClient } from "@/shared/lib/signalr/create-hub-client";

export type SubmissionCompletedPush = {
  submissionId: string;
};

const SUBMISSION_COMPLETED_EVENT = "SubmissionCompleted";

const hub = createHubClient("/hubs/submission");

export const connectSubmissionHub = async (): Promise<void> => {
  await hub.ensureConnected();
};

export const onSubmissionCompletedPush = (
  handler: (payload: SubmissionCompletedPush) => void
): (() => void) => {
  const connection = hub.getConnectionWithoutStarting();
  connection.on(SUBMISSION_COMPLETED_EVENT, handler);
  return () => connection.off(SUBMISSION_COMPLETED_EVENT, handler);
};
