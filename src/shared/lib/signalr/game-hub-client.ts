import * as signalR from "@microsoft/signalr";
import { env } from "@/env";
import { getSharedAccessToken } from "@/shared/lib/get-shared-access-token";
import type { SubmissionStatus } from "@/domains/submission/models/submission-status";

/**
 * Payload the server pushes on the "GameCompleted" hub method. Deliberately treated as just a
 * "go re-fetch" signal. The game's actual status/timestamps are read back from the REST API
 * (the source of truth), not trusted directly off the socket. This keeps the client's game-status
 * parsing logic in one place (game-api.ts) instead of duplicated here.
 */
export type GameCompletedPush = {
  gameId: string;
};

/** Payload the server pushes on the "GameLobbyUpdated" hub method, whenever someone joins or
 *  leaves a still-Pending lobby. Same "just a re-fetch signal" treatment as GameCompletedPush. */
export type GameLobbyUpdatedPush = {
  gameId: string;
};

/** Payload the server pushes on the "GameProgressUpdated" hub method, whenever a participant's
 *  progress changes in a Running game (they solved a problem). Same "just a re-fetch signal"
 *  treatment as GameCompletedPush. The actual score is read back from the REST API. */
export type GameProgressUpdatedPush = {
  gameId: string;
};

/** Payload the server pushes on the "GameParticipantAttempted" hub method, whenever a
 *  participant's submission in a Running game reaches a terminal state. Unlike the other pushes
 *  here, this one carries its own data: it's the sole source for the live activity feed, with no
 *  REST endpoint to fall back on. */
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

const HUB_PATH = "/hubs/game";
const GAME_COMPLETED_EVENT = "GameCompleted";
const GAME_LOBBY_UPDATED_EVENT = "GameLobbyUpdated";
const GAME_PROGRESS_UPDATED_EVENT = "GameProgressUpdated";
const GAME_PARTICIPANT_ATTEMPTED_EVENT = "GameParticipantAttempted";
const GAME_PARTICIPANT_REACTED_EVENT = "GameParticipantReacted";

let connection: signalR.HubConnection | null = null;
let connectPromise: Promise<void> | null = null;
const joinedGameIds = new Set<string>();

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

  // Group membership lives on the connection ID server-side, so a reconnect (new connection ID)
  // drops it silently. Rejoin whatever games we were watching once the new connection is live.
  connection.onreconnected(() => {
    joinedGameIds.forEach((gameId) => {
      connection?.invoke("JoinGame", gameId).catch(() => {
        // Best-effort: the game loop's fallback poll covers a missed rejoin.
      });
    });
  });

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
 * Joins the per-game update group for `gameId`. Throws if the connection or the server-side
 * authorization check (participant/permission) fails. Callers should treat that as "push
 * notifications aren't available for this game" and fall back to polling, not as fatal.
 */
export const joinGameUpdates = async (gameId: string): Promise<void> => {
  const conn = await ensureConnected();
  await conn.invoke("JoinGame", gameId);
  joinedGameIds.add(gameId);
};

/** Best-effort leave: never throws, since staying in a group briefly longer is harmless. */
export const leaveGameUpdates = async (gameId: string): Promise<void> => {
  joinedGameIds.delete(gameId);

  try {
    if (connection?.state === signalR.HubConnectionState.Connected) {
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
    const conn = await ensureConnected();
    await conn.invoke("SendReaction", gameId, emoji);
  } catch {
    // Fine to ignore: see doc comment above.
  }
};

/**
 * Subscribes to game-completed pushes. Returns an unsubscribe function. Safe to call even before
 * the connection exists. The underlying HubConnection instance is created lazily and handlers
 * persist across reconnects.
 */
export const onGameCompletedPush = (
  handler: (payload: GameCompletedPush) => void
): (() => void) => {
  const conn = getConnection();
  conn.on(GAME_COMPLETED_EVENT, handler);
  return () => conn.off(GAME_COMPLETED_EVENT, handler);
};

/**
 * Subscribes to lobby-updated pushes (someone joined/left a Pending game). Same semantics as
 * onGameCompletedPush. Safe to call before the connection exists, returns an unsubscribe fn.
 */
export const onGameLobbyUpdatedPush = (
  handler: (payload: GameLobbyUpdatedPush) => void
): (() => void) => {
  const conn = getConnection();
  conn.on(GAME_LOBBY_UPDATED_EVENT, handler);
  return () => conn.off(GAME_LOBBY_UPDATED_EVENT, handler);
};

/**
 * Subscribes to progress-updated pushes (a participant solved a problem in a Running game).
 * Same semantics as onGameCompletedPush.
 */
export const onGameProgressUpdatedPush = (
  handler: (payload: GameProgressUpdatedPush) => void
): (() => void) => {
  const conn = getConnection();
  conn.on(GAME_PROGRESS_UPDATED_EVENT, handler);
  return () => conn.off(GAME_PROGRESS_UPDATED_EVENT, handler);
};

/**
 * Subscribes to participant-attempted pushes (someone's submission in a Running game reached a
 * terminal state). Unlike the other subscriptions here, this payload isn't a re-fetch signal:
 * it's the only source for the live activity feed. Same safe-to-call-early semantics as
 * onGameCompletedPush.
 */
export const onGameParticipantAttemptedPush = (
  handler: (payload: GameParticipantAttemptedPush) => void
): (() => void) => {
  const conn = getConnection();
  conn.on(GAME_PARTICIPANT_ATTEMPTED_EVENT, handler);
  return () => conn.off(GAME_PARTICIPANT_ATTEMPTED_EVENT, handler);
};

/**
 * Subscribes to participant-reacted pushes (someone sent a quick emoji reaction in a Running
 * game). Same semantics as onGameParticipantAttemptedPush: no re-fetch fallback, safe to call
 * before the connection exists.
 */
export const onGameParticipantReactedPush = (
  handler: (payload: GameParticipantReactedPush) => void
): (() => void) => {
  const conn = getConnection();
  conn.on(GAME_PARTICIPANT_REACTED_EVENT, handler);
  return () => conn.off(GAME_PARTICIPANT_REACTED_EVENT, handler);
};
