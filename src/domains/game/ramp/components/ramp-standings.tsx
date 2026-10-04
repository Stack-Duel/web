"use client";

import { Crown } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import { cn } from "@/shared/lib/utils";
import type { Game } from "../../models/game";

type RampStandingsProps = {
  game: Game;
};

/**
 * Live standings for the ramp workspace's "Score" tab, sorted highest score first, so a
 * player can check who's ahead mid-game, not just at the end (GameOverSummary already
 * shows the same ranked list there). Reflects whatever `game` currently holds in the query
 * cache, which useGameSession keeps fresh via a "GameProgressUpdated" SignalR push (raised
 * from Game.RecordProblemSolved whenever any participant's score changes). The periodic
 * poll it also runs while Running is just the fallback for when that push can't connect
 * (e.g. a proxy blocking websockets), not the primary update path.
 */
export default function RampStandings({ game }: Readonly<RampStandingsProps>) {
  const user = useUserStore(selectUser);

  const sorted = [...game.participants].sort((a, b) => b.score - a.score);
  const topScore = sorted[0]?.score ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-4">
      {sorted.map((participant, index) => (
        <div
          key={participant.userId}
          className={cn(
            "flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2",
            participant.hasForfeited && "opacity-60"
          )}
        >
          <span className="w-5 shrink-0 text-center text-sm font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <Avatar size="sm">
            <AvatarImage
              src={participant.imageUrl}
              alt={participant.username}
            />
            <AvatarFallback>
              {participant.username?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 truncate text-sm font-medium">
            {participant.username}
            {participant.userId === user?.id ? " (You)" : ""}
          </span>
          {participant.hasForfeited ? (
            <Badge variant="destructive">Forfeited</Badge>
          ) : participant.hasFinishedProblems ? (
            <Badge variant="secondary">Finished</Badge>
          ) : null}
          {participant.score === topScore ? (
            <Crown size={14} className="text-amber-600 dark:text-amber-400" />
          ) : null}
          <span className="text-sm font-semibold tabular-nums">
            {participant.score}
          </span>
        </div>
      ))}
    </div>
  );
}
