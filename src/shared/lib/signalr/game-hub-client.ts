import { z } from "zod";
import { HubConnectionState } from "@microsoft/signalr";
import { createHubClient } from "@/shared/lib/signalr/create-hub-client";
import type { SubmissionStatus } from "@/domains/submission/models/submission-status";

export type GameRefetchPush = {
  gameId: string;
};

export type GameParticipantAttemptedPush = {
  gameId: string;
  userId: string;
  status: SubmissionStatus;
  attemptedAt: string;
};

export type GameParticipantReactedPush = {
  gameId: string;
  userId: string;
  emoji: string;
  sentAt: string;
};

export const GameHubEvent = {
  Completed: "GameCompleted",
  LobbyUpdated: "GameLobbyUpdated",
  ProgressUpdated: "GameProgressUpdated",
  ParticipantAttempted: "GameParticipantAttempted",
  ParticipantReacted: "GameParticipantReacted",
} as const;

type GameHubPayloads = {
  [GameHubEvent.Completed]: GameRefetchPush;
  [GameHubEvent.LobbyUpdated]: GameRefetchPush;
  [GameHubEvent.ProgressUpdated]: GameRefetchPush;
  [GameHubEvent.ParticipantAttempted]: GameParticipantAttemptedPush;
  [GameHubEvent.ParticipantReacted]: GameParticipantReactedPush;
};

const refetchPushSchema = z.object({ gameId: z.string().min(1) });

const gamePushSchemas = {
  [GameHubEvent.Completed]: refetchPushSchema,
  [GameHubEvent.LobbyUpdated]: refetchPushSchema,
  [GameHubEvent.ProgressUpdated]: refetchPushSchema,
  [GameHubEvent.ParticipantAttempted]: z.object({
    gameId: z.string().min(1),
    userId: z.string().min(1),
    status: z.enum(["Queued", "Running", "Accepted", "WrongAnswer"]),
    attemptedAt: z.string().min(1),
  }),
  [GameHubEvent.ParticipantReacted]: z.object({
    gameId: z.string().min(1),
    userId: z.string().min(1),
    emoji: z.string().min(1),
    sentAt: z.string().min(1),
  }),
} as const;

const joinCounts = new Map<string, number>();

const hub = createHubClient("/hubs/game", {
  onReconnected: (connection) => {
    joinCounts.forEach((_count, gameId) => {
      connection.invoke("JoinGame", gameId).catch(() => {});
    });
  },
});

export const joinGameUpdates = async (gameId: string): Promise<void> => {
  const previousCount = joinCounts.get(gameId) ?? 0;
  joinCounts.set(gameId, previousCount + 1);

  if (previousCount > 0) {
    return;
  }

  try {
    const connection = await hub.ensureConnected();
    await connection.invoke("JoinGame", gameId);
  } catch (error) {
    const count = joinCounts.get(gameId) ?? 1;
    if (count <= 1) {
      joinCounts.delete(gameId);
    } else {
      joinCounts.set(gameId, count - 1);
    }
    throw error;
  }
};

export const leaveGameUpdates = async (gameId: string): Promise<void> => {
  const count = joinCounts.get(gameId) ?? 0;

  if (count > 1) {
    joinCounts.set(gameId, count - 1);
    return;
  }

  joinCounts.delete(gameId);

  if (count === 0) {
    return;
  }

  try {
    const connection = hub.getConnectionWithoutStarting();
    if (connection.state === HubConnectionState.Connected) {
      await connection.invoke("LeaveGame", gameId);
    }
  } catch {}
};

export const sendGameReaction = async (
  gameId: string,
  emoji: string
): Promise<void> => {
  try {
    const connection = await hub.ensureConnected();
    await connection.invoke("SendReaction", gameId, emoji);
  } catch {}
};

export const onGamePush = <TEvent extends keyof GameHubPayloads>(
  event: TEvent,
  handler: (payload: GameHubPayloads[TEvent]) => void
): (() => void) => {
  const connection = hub.getConnectionWithoutStarting();

  const guardedHandler = (payload: unknown) => {
    const parsed = gamePushSchemas[event].safeParse(payload);
    if (!parsed.success) return;

    handler(parsed.data as GameHubPayloads[TEvent]);
  };

  connection.on(event, guardedHandler);
  return () => connection.off(event, guardedHandler);
};
