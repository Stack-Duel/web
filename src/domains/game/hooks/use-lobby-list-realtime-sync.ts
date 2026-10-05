"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  joinGameUpdates,
  leaveGameUpdates,
  onGameLobbyUpdatedPush,
} from "@/shared/lib/signalr/game-hub-client";

/**
 * Keeps the Games list live for the caller's own Pending games: joins the SignalR
 * lobby-update group for each `gameId` given and invalidates "my-active-games" and
 * "open-games" on a "GameLobbyUpdated" push for one of them, the same push
 * useGameSession relies on inside an individual lobby. Those queries' own polling
 * is the fallback if SignalR can't connect.
 */
export function useLobbyListRealtimeSync(pendingGameIds: string[]) {
  const queryClient = useQueryClient();
  const joinedIds = useRef(new Set<string>());
  const idsKey = pendingGameIds
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .join(",");

  useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];
    let cancelled = false;

    ids.forEach((id) => {
      if (joinedIds.current.has(id)) return;
      void joinGameUpdates(id)
        .then(() => {
          if (!cancelled) joinedIds.current.add(id);
        })
        .catch(() => {
          // SignalR unavailable; the underlying queries' own polling covers it.
        });
    });

    joinedIds.current.forEach((id) => {
      if (ids.includes(id)) return;
      joinedIds.current.delete(id);
      void leaveGameUpdates(id);
    });

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  useEffect(() => {
    return onGameLobbyUpdatedPush((push) => {
      if (!joinedIds.current.has(push.gameId)) return;
      queryClient.invalidateQueries({ queryKey: ["my-active-games"] });
      queryClient.invalidateQueries({ queryKey: ["open-games"] });
    });
  }, [queryClient]);

  useEffect(() => {
    const joined = joinedIds.current;
    return () => {
      joined.forEach((id) => void leaveGameUpdates(id));
      joined.clear();
    };
  }, []);
}
