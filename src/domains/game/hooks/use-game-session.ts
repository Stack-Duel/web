"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useStartGame } from "../api/start-game";
import { problemByIdQueryOptions } from "@/domains/problem/api/get-problem-by-id";
import {
  useInitializeProblem,
  useClearProblem,
} from "@/domains/problem/hooks/use-problem-actions";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import {
  useGameSessionStore,
  selectPendingNextProblemId,
} from "../state/game-session-store";
import {
  joinGameUpdates,
  leaveGameUpdates,
  onGameCompletedPush,
  onGameLobbyUpdatedPush,
  onGameParticipantAttemptedPush,
  onGameParticipantReactedPush,
  onGameProgressUpdatedPush,
} from "@/shared/lib/signalr/game-hub-client";
import { Game, GameStatus } from "../models/game";
import { GameModeKey } from "../models/game-mode";
import { gameQueryOptions, useGame } from "../api/get-game";

const isGameStatus = (game: Game, status: GameStatus) => game.status === status;

/**
 * Loads and keeps a game session in sync: fetches the game, auto-starts it once
 * if it's Pending, subscribes to SignalR pushes while Pending ("GameLobbyUpdated")
 * or Running ("GameProgressUpdated", "GameCompleted"), polls as a fallback (5s
 * Pending, 8s Running), and loads the current user's active problem into the
 * problem-setup store whenever the game or the user identity becomes available.
 * Replaces `registerGameListeners`.
 */
export function useGameSession(gameId: string) {
  const queryClient = useQueryClient();
  const clearProblem = useClearProblem();
  const workspaceReset = useWorkspaceStore((s) => s.reset);
  const gameSessionReset = useGameSessionStore((s) => s.reset);
  const addFeedEntry = useGameSessionStore((s) => s.addFeedEntry);
  const pendingNextProblemId = useGameSessionStore(selectPendingNextProblemId);
  const initializeProblem = useInitializeProblem();
  const user = useUserStore(selectUser);

  const gameQuery = useGame({
    gameId,
    // Fallback for when the SignalR push below can't connect (e.g. a proxy blocking
    // websockets) or a push gets missed. "GameProgressUpdated" (someone solved a problem)
    // and "GameCompleted" are the primary update path while Running, not this interval.
    // Pending polls tighter (a join/leave should show up within a few seconds); Running polls
    // a bit lighter since the push (plus the player's own actions triggering incidental
    // refetches) usually beats it anyway.
    queryConfig: {
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === GameStatus.Pending) return 5_000;
        if (status === GameStatus.Running) return 8_000;
        return false;
      },
    },
  });
  const { mutateAsync: startGame } = useStartGame();

  const startRequestedForGameId = useRef<string | null>(null);
  const previousGameId = useRef<string | null>(null);
  const lastLoadedProblemId = useRef<string | null>(null);

  // Navigating fresh to a game (or to a different game entirely): wipe any
  // problem/workspace state left over from a previous /problem/{slug} page or
  // a different game so the workspace never flashes stale content.
  useEffect(() => {
    if (previousGameId.current !== gameId) {
      previousGameId.current = gameId;
      startRequestedForGameId.current = null;
      lastLoadedProblemId.current = null;
      clearProblem();
      workspaceReset();
      gameSessionReset();
    }
  }, [gameId, clearProblem, workspaceReset, gameSessionReset]);

  const game = gameQuery.data;

  // Auto-start a Pending game, once per page load. Solo Rush only, since it's the
  // only mode with exactly one player, so there's no lobby to wait in.
  // Multiplayer modes (Duel, FFA) instead sit in LobbyWorkspace until the
  // host explicitly starts, once enough players have joined.
  useEffect(() => {
    if (game?.gameModeKey !== GameModeKey.SoloRush) return;
    if (!isGameStatus(game, GameStatus.Pending)) return;
    if (startRequestedForGameId.current === game.gameId) return;

    startRequestedForGameId.current = game.gameId;

    void startGame(
      { gameId: game.gameId },
      {
        onError: () => {
          startRequestedForGameId.current = null;
        },
      }
    );
    // start-game's mutation invalidates the game query on success, which
    // triggers the refetch that used to be the explicit getGame dispatch.
  }, [game, startGame]);

  // Subscribe to SignalR pushes while the game is Pending or Running so the UI updates
  // immediately rather than waiting on a fallback: "GameLobbyUpdated" while Pending (someone
  // joined/left; the 5s poll above is the fallback for this one, since there's no other
  // time-based re-fetch during the lobby phase), "GameProgressUpdated" while Running (someone
  // solved a problem; otherwise the Score tab would only ever update from the 8s poll or the
  // viewer's own actions), "GameCompleted" while Running (the client-side countdown's
  // one-shot re-fetch is the fallback there, which might race server finalization), and
  // "GameParticipantAttempted"/"GameParticipantReacted" while Running (a participant's submission
  // reached a terminal state, or they sent a quick reaction. Both feed the live chat panel and have
  // no fallback at all since neither is a re-fetch signal). One subscription covers all five
  // without dropping and rejoining the SignalR group across the Pending -> Running transition.
  // Depends on gameId/status specifically (not the whole `game`
  // object) so a routine poll/refetch doesn't tear this down and redo the group join on every
  // tick. `gameId` (the hook's own param) is used rather than `game.gameId`, since it's known
  // synchronously, no need to wait on fetched data for it.
  const gameStatus = game?.status;
  useEffect(() => {
    if (gameStatus !== GameStatus.Pending && gameStatus !== GameStatus.Running)
      return;

    const activeGameId = gameId;
    let unsubscribeCompleted = () => {};
    let unsubscribeLobbyUpdated = () => {};
    let unsubscribeProgressUpdated = () => {};
    let unsubscribeParticipantAttempted = () => {};
    let unsubscribeParticipantReacted = () => {};
    let cancelled = false;

    const invalidateGame = () => {
      queryClient.invalidateQueries({
        queryKey: gameQueryOptions({ gameId: activeGameId }).queryKey,
      });
    };

    void joinGameUpdates(activeGameId)
      .then(() => {
        if (cancelled) return;
        unsubscribeCompleted = onGameCompletedPush((push) => {
          if (push.gameId === activeGameId) invalidateGame();
        });
        unsubscribeLobbyUpdated = onGameLobbyUpdatedPush((push) => {
          if (push.gameId === activeGameId) invalidateGame();
        });
        unsubscribeProgressUpdated = onGameProgressUpdatedPush((push) => {
          if (push.gameId === activeGameId) invalidateGame();
        });
        unsubscribeParticipantAttempted = onGameParticipantAttemptedPush(
          (push) => {
            if (push.gameId !== activeGameId) return;
            addFeedEntry({
              id: crypto.randomUUID(),
              type: "attempt",
              userId: push.userId,
              status: push.status,
              createdAt: push.attemptedAt,
            });
          }
        );
        unsubscribeParticipantReacted = onGameParticipantReactedPush((push) => {
          if (push.gameId !== activeGameId) return;
          addFeedEntry({
            id: crypto.randomUUID(),
            type: "reaction",
            userId: push.userId,
            emoji: push.emoji,
            createdAt: push.sentAt,
          });
        });
      })
      .catch(() => {
        // SignalR unavailable. The Pending-phase poll / Running-phase poll+timer re-fetch
        // (see above) are the fallbacks. The live chat panel has no such fallback: it just
        // stays empty until a connection is available.
      });

    return () => {
      cancelled = true;
      unsubscribeCompleted();
      unsubscribeLobbyUpdated();
      unsubscribeProgressUpdated();
      unsubscribeParticipantAttempted();
      unsubscribeParticipantReacted();
      void leaveGameUpdates(activeGameId);
    };
  }, [gameId, gameStatus, queryClient, addFeedEntry]);

  // Load the current user's active problem for this game, if it isn't already
  // loaded. Re-runs whenever the game or the user identity changes, which
  // covers both orderings of the hard-refresh race between auth/user sync and
  // the game fetch (whichever becomes available second triggers the load),
  // and skips re-fetching when the problem ID hasn't actually changed (e.g. a
  // routine game poll), guarded by the lastLoadedProblemId ref above.
  //
  // Skipped entirely while pendingNextProblemId is set: completeProblem
  // already advances the participant's currentProblem server-side, so the
  // post-submit refetch would otherwise swap the workspace to the next
  // problem before the player clicks "Next Problem". useLoadNextProblem
  // (triggered by that click) is what's responsible for loading it instead.
  useEffect(() => {
    if (!user || !game || pendingNextProblemId !== undefined) return;

    const participant = game.participants.find((p) => p.userId === user.id);
    const problemId = participant?.currentProblem?.problemId;
    if (!problemId || problemId === lastLoadedProblemId.current) return;

    lastLoadedProblemId.current = problemId;

    void queryClient
      .fetchQuery(problemByIdQueryOptions({ id: problemId }))
      .then((problem) => {
        // Always re-initialize even if this races a newer fetch. The store
        // update is idempotent per problem ID, and initializeProblem also
        // resets the editor's codeVersionId so the workspace resets cleanly.
        initializeProblem(problem);
      })
      .catch(() => {
        lastLoadedProblemId.current = null;
      });
  }, [user, game, pendingNextProblemId, queryClient, initializeProblem]);

  return {
    game,
    isLoading: gameQuery.isLoading,
    error: gameQuery.error?.message ?? null,
    refetch: gameQuery.refetch,
  };
}
