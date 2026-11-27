"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  GameHubEvent,
  joinGameUpdates,
  leaveGameUpdates,
  onGamePush,
} from "@/shared/lib/signalr/game-hub-client";

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
        .catch(() => {});
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
    return onGamePush(GameHubEvent.LobbyUpdated, (push) => {
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
