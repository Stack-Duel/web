import { z } from "zod";
import { HubConnectionState } from "@microsoft/signalr";
import { createHubClient } from "@/shared/lib/signalr/create-hub-client";
import type { SubmissionStatus } from "@/domains/submission/models/submission-status";

/**
 * Payload the server pushes on the "GameCompleted", "GameLobbyUpdated" and
 * "GameProgressUpdated" hub methods. Deliberately treated as just a "go re-fetch" signal: the
 * game's actual status, roster and scores are read back from the REST API (the source of truth)
 * rather than trusted off the socket, which keeps the client's parsing logic in one place
 * (game-api.ts) instead of duplicated here.
 */
export type GameRefetchPush = {
  gameId: string;
};

/** Payload the server pushes on the "GameParticipantAttempted" hub method, whenever a
 *  participant's submission in a Running game reaches a terminal state. Unlike the re-fetch
 *  signals, this one carries its own data: it's the sole source for the live activity feed, with
 *  no REST endpoint to fall back on. */
export type GameParticipantAttemptedPush = {
  gameId: string;
  userId: string;
  status: SubmissionStatus;
  attemptedAt: string;
};

/** Payload the server pushes on the "GameParticipantReacted" hub method, whenever a participant
 *  sends a quick emoji reaction in a Running game. Same "carries its own data" treatment as
 *  GameParticipantAttemptedPush. There's nothing persisted behind this to fall back on. */
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
      connection.invoke("JoinGame", gameId).catch(() => {
        // Best-effort: the game loop's fallback poll covers a missed rejoin.
      });
    });
  },
});

/**
 * Joins the per-game update group for `gameId`. Throws if the connection or the server-side
 * authorization check (participant/permission) fails. Callers should treat that as "push
 * notifications aren't available for this game" and fall back to polling, not as fatal.
 */
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

/** Best-effort leave: never throws, since staying in a group briefly longer is harmless. */
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
  } catch {
    // Fine to ignore: the connection may already be closed/closing.
  }
};

/**
 * Sends a quick emoji reaction to everyone watching `gameId`. Best-effort like leaveGameUpdates:
 * a dropped reaction is cosmetic (a missing bubble in the chat), not something worth surfacing as
 * an error to the sender.
 */
export const sendGameReaction = async (
  gameId: string,
  emoji: string
): Promise<void> => {
  try {
    const connection = await hub.ensureConnected();
    await connection.invoke("SendReaction", gameId, emoji);
  } catch {
    // Fine to ignore: see doc comment above.
  }
};

/**
 * Subscribes to one game hub event. Returns an unsubscribe function. Safe to call even before the
 * connection exists: the underlying HubConnection is created lazily and handlers persist across
 * reconnects.
 */
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
