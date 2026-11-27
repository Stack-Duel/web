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
  selectHasSolvedCurrentProblem,
} from "../state/game-session-store";
import { useGradingProblemId } from "./use-grading-problem-id";
import {
  GameHubEvent,
  joinGameUpdates,
  leaveGameUpdates,
  onGamePush,
} from "@/shared/lib/signalr/game-hub-client";
import { Game, GameStatus } from "../models/game";
import { GameModeKey } from "../models/game-mode";
import { gameQueryOptions, useGame } from "../api/get-game";

const isGameStatus = (game: Game, status: GameStatus) => game.status === status;

export function useGameSession(gameId: string) {
  const queryClient = useQueryClient();
  const clearProblem = useClearProblem();
  const workspaceReset = useWorkspaceStore((s) => s.reset);
  const gameSessionReset = useGameSessionStore((s) => s.reset);
  const addFeedEntry = useGameSessionStore((s) => s.addFeedEntry);
  const hasSolvedCurrentProblem = useGameSessionStore(
    selectHasSolvedCurrentProblem
  );
  const initializeProblem = useInitializeProblem();
  const user = useUserStore(selectUser);

  const gameQuery = useGame({
    gameId,
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
  const gradingProblemId = useGradingProblemId(game);

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
  }, [game, startGame]);

  const isWatchableGame =
    game?.status === GameStatus.Pending || game?.status === GameStatus.Running;

  useEffect(() => {
    if (!isWatchableGame) return;

    const activeGameId = gameId;
    const unsubscribers: Array<() => void> = [];
    let cancelled = false;

    const invalidateGame = () => {
      queryClient.invalidateQueries({
        queryKey: gameQueryOptions({ gameId: activeGameId }).queryKey,
      });
    };

    const onRefetchSignal = (push: { gameId: string }) => {
      if (push.gameId === activeGameId) invalidateGame();
    };

    void joinGameUpdates(activeGameId)
      .then(() => {
        if (cancelled) return;

        unsubscribers.push(
          onGamePush(GameHubEvent.Completed, onRefetchSignal),
          onGamePush(GameHubEvent.LobbyUpdated, onRefetchSignal),
          onGamePush(GameHubEvent.ProgressUpdated, onRefetchSignal),
          onGamePush(GameHubEvent.ParticipantAttempted, (push) => {
            if (push.gameId !== activeGameId) return;
            addFeedEntry({
              id: `attempt:${push.userId}:${push.attemptedAt}`,
              type: "attempt",
              userId: push.userId,
              status: push.status,
              createdAt: push.attemptedAt,
            });
          }),
          onGamePush(GameHubEvent.ParticipantReacted, (push) => {
            if (push.gameId !== activeGameId) return;
            addFeedEntry({
              id: `reaction:${push.userId}:${push.sentAt}:${push.emoji}`,
              type: "reaction",
              userId: push.userId,
              emoji: push.emoji,
              createdAt: push.sentAt,
            });
          })
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      void leaveGameUpdates(activeGameId);
    };
  }, [gameId, isWatchableGame, queryClient, addFeedEntry]);

  useEffect(() => {
    const isGradingInFlight = Boolean(gradingProblemId);
    if (!user || !game || isGradingInFlight || hasSolvedCurrentProblem) return;

    const participant = game.participants.find((p) => p.userId === user.id);
    const problemId = participant?.currentProblem?.problemId;
    if (!problemId || problemId === lastLoadedProblemId.current) return;

    lastLoadedProblemId.current = problemId;

    void queryClient
      .fetchQuery(problemByIdQueryOptions({ id: problemId }))
      .then((problem) => {
        initializeProblem(problem);
      })
      .catch(() => {
        lastLoadedProblemId.current = null;
      });
  }, [
    user,
    game,
    hasSolvedCurrentProblem,
    gradingProblemId,
    queryClient,
    initializeProblem,
  ]);

  return {
    game,
    isLoading: gameQuery.isLoading,
    error: gameQuery.error?.message ?? null,
    refetch: gameQuery.refetch,
  };
}
