import * as signalR from "@microsoft/signalr";
import { env } from "@/env";
import { getSharedAccessToken } from "@/shared/lib/get-shared-access-token";

export class MissingAccessTokenError extends Error {
  constructor() {
    super("Not signed in.");
    this.name = "MissingAccessTokenError";
  }
}

export type HubClient = {
  getConnectionWithoutStarting: () => signalR.HubConnection;
  ensureConnected: () => Promise<signalR.HubConnection>;
};

export const createHubClient = (
  hubPath: string,
  options?: { onReconnected?: (connection: signalR.HubConnection) => void }
): HubClient => {
  let connection: signalR.HubConnection | null = null;
  let startPromise: Promise<void> | null = null;
  let reconnectPromise: Promise<void> | null = null;
  let resolveReconnect: (() => void) | null = null;

  const getConnectionWithoutStarting = (): signalR.HubConnection => {
    if (connection) {
      return connection;
    }

    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${env.NEXT_PUBLIC_API_SERVER_URL}${hubPath}`, {
        accessTokenFactory: async () => {
          const token = await getSharedAccessToken();
          if (!token) {
            throw new MissingAccessTokenError();
          }
          return token;
        },
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.onreconnecting(() => {
      startPromise = null;
      reconnectPromise = new Promise<void>((resolve) => {
        resolveReconnect = resolve;
      });
    });

    connection.onreconnected(() => {
      resolveReconnect?.();
      resolveReconnect = null;
      reconnectPromise = null;

      if (connection) {
        options?.onReconnected?.(connection);
      }
    });

    connection.onclose(() => {
      startPromise = null;
      resolveReconnect?.();
      resolveReconnect = null;
      reconnectPromise = null;
    });

    return connection;
  };

  const ensureConnected = async (): Promise<signalR.HubConnection> => {
    const conn = getConnectionWithoutStarting();
    const stateBeforeWaiting: signalR.HubConnectionState = conn.state;

    if (stateBeforeWaiting === signalR.HubConnectionState.Connected) {
      return conn;
    }

    if (
      stateBeforeWaiting === signalR.HubConnectionState.Reconnecting &&
      reconnectPromise
    ) {
      await reconnectPromise;

      const stateAfterWaiting: signalR.HubConnectionState = conn.state;
      if (stateAfterWaiting !== signalR.HubConnectionState.Connected) {
        throw new Error(`Hub ${hubPath} is not connected.`);
      }

      return conn;
    }

    startPromise ??= conn.start().catch((error) => {
      startPromise = null;
      throw error;
    });

    await startPromise;

    return conn;
  };

  return { getConnectionWithoutStarting, ensureConnected };
};
