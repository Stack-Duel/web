import * as signalR from "@microsoft/signalr";
import { env } from "@/env";
import { getSharedAccessToken } from "@/shared/lib/get-shared-access-token";

/**
 * Payload the server pushes on the "SubmissionCompleted" hub method. Treated as a
 * "go re-fetch" signal. The submission's actual results are read back from the REST API.
 */
export type SubmissionCompletedPush = {
  submissionId: string;
};

const HUB_PATH = "/hubs/submission";
const SUBMISSION_COMPLETED_EVENT = "SubmissionCompleted";

let connection: signalR.HubConnection | null = null;
let connectPromise: Promise<void> | null = null;

const getConnection = (): signalR.HubConnection => {
  if (connection) {
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${env.NEXT_PUBLIC_API_SERVER_URL}${HUB_PATH}`, {
      accessTokenFactory: async () => (await getSharedAccessToken()) ?? "",
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  // The server's OnConnectedAsync re-adds the user to their personal group on every
  // new connection (including reconnects), so no client-side rejoin logic is needed here.
  connection.onclose(() => {
    connectPromise = null;
  });

  return connection;
};

const ensureConnected = async (): Promise<signalR.HubConnection> => {
  const conn = getConnection();

  if (conn.state !== signalR.HubConnectionState.Connected) {
    connectPromise ??= conn.start().catch((error) => {
      connectPromise = null;
      throw error;
    });

    await connectPromise;
  }

  return conn;
};

/**
 * Connects to the submission hub if not already connected. Call before subscribing
 * to submission-completed pushes. Safe to call multiple times: returns immediately
 * when already connected.
 */
export const connectSubmissionHub = async (): Promise<void> => {
  await ensureConnected();
};

/**
 * Subscribes to submission-completed pushes for the current user. Returns an
 * unsubscribe function. Safe to call before the connection is started: handlers
 * persist across reconnects.
 */
export const onSubmissionCompletedPush = (
  handler: (payload: SubmissionCompletedPush) => void
): (() => void) => {
  const conn = getConnection();
  conn.on(SUBMISSION_COMPLETED_EVENT, handler);
  return () => conn.off(SUBMISSION_COMPLETED_EVENT, handler);
};
