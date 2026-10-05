import { Crown } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { Game } from "../models/game";

type RivalScoreBadgeProps = {
  game: Game;
  currentUserId: string | undefined;
  className?: string;
};

/**
 * The score to beat, shown next to the player's own ScoreBadge so both
 * numbers are visible at a glance during play, not just from the Score tab:
 * the opponent's score in Duel (the only other participant), or in FFA
 * (three or more) whoever's currently ahead of the player: the leader's
 * score normally, or the runner-up's score once the player himself holds
 * first place, so there's always someone to chase instead of the badge just
 * disappearing. Renders nothing for Solo Rush (no one to compare against).
 */
export default function RivalScoreBadge({
  game,
  currentUserId,
  className,
}: Readonly<RivalScoreBadgeProps>) {
  if (game.participants.length < 2) return null;

  const isDuel = game.participants.length === 2;

  if (isDuel) {
    const opponent = game.participants.find((p) => p.userId !== currentUserId);
    if (!opponent) return null;

    return (
      <Badge
        variant="outline"
        className={cn("h-7 max-w-32 gap-1.5 px-2.5 text-sm", className)}
      >
        <span className="truncate text-muted-foreground">
          {opponent.username}:
        </span>
        <span className="shrink-0 font-semibold tabular-nums">
          {opponent.score}
        </span>
      </Badge>
    );
  }

  const topScore = Math.max(...game.participants.map((p) => p.score));
  const currentScore =
    game.participants.find((p) => p.userId === currentUserId)?.score ?? 0;

  // Tied for first still counts as holding first place. Only fall back to
  // showing the runner-up once someone else is strictly ahead of the pack
  // the player is tied into.
  const isLeading = currentScore === topScore;
  const rivalScore = isLeading
    ? Math.max(
        ...game.participants
          .filter((p) => p.userId !== currentUserId)
          .map((p) => p.score)
      )
    : topScore;
  const label = rivalScore === topScore ? "1st" : "2nd";

  return (
    <Badge
      variant="outline"
      className={cn("h-7 gap-1.5 px-2.5 text-sm", className)}
    >
      {label === "1st" ? (
        <Crown
          aria-hidden="true"
          className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
        />
      ) : null}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold tabular-nums">{rivalScore}</span>
    </Badge>
  );
}
