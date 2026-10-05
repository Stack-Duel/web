"use client";

import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import { Crown } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import GameTimer from "./game-timer";
import { useGameTimeExpired } from "../hooks/use-game-time-expired";
import type { Game, GameParticipant } from "../models/game";

type PlayerScoreProps = {
  participant: GameParticipant;
  typeOfPlayer: "self" | "opponent";
  place?: string;
  /** Currently ahead of the player shown on the other side of this header. Drives the accent
   *  color/crown. Deliberately not tied to self/opponent identity, so the highlight follows
   *  whoever's winning right now rather than staying fixed on "you". */
  isLeading: boolean;
  isTie: boolean;
};

const SCORE_POP_DURATION_MS = 900;

function PlayerScore({
  participant,
  typeOfPlayer,
  place,
  isLeading,
  isTie,
}: Readonly<PlayerScoreProps>) {
  const isSelf = typeOfPlayer === "self";
  const accentColor = isTie
    ? "text-foreground"
    : isLeading
      ? "text-emerald-500"
      : "text-rose-500";

  const previousScoreRef = useRef(participant.score);
  const [showScorePop, setShowScorePop] = useState(false);

  useEffect(() => {
    const scoreIncreased = participant.score > previousScoreRef.current;
    previousScoreRef.current = participant.score;

    if (!scoreIncreased) return;

    setShowScorePop(true);
    const timeout = setTimeout(
      () => setShowScorePop(false),
      SCORE_POP_DURATION_MS
    );
    return () => clearTimeout(timeout);
  }, [participant.score]);

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        !isSelf && "flex-row-reverse",
        participant.hasForfeited && "opacity-50"
      )}
    >
      {place ? (
        <span className={cn("text-xs font-bold tabular-nums", accentColor)}>
          {place}
        </span>
      ) : null}
      <Avatar
        size="sm"
        className={cn(
          "ring-2",
          isTie
            ? "ring-border"
            : isLeading
              ? "ring-emerald-500/50"
              : "ring-rose-500/50"
        )}
      >
        <AvatarImage src={participant.imageUrl} alt={participant.username} />
        <AvatarFallback
          className={cn(
            isTie
              ? undefined
              : isLeading
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
          )}
        >
          {participant.username?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <span className={cn("text-sm @6xl:flex hidden", accentColor)}>
        {participant.username} {participant.hasForfeited ? "(forfeited)" : ""}
      </span>
      {isLeading && !isTie ? (
        <Crown
          size={14}
          className="text-amber-600 dark:text-amber-400"
          aria-label="Leading"
        />
      ) : null}
      <span className="relative">
        <span className={cn("font-semibold", accentColor)}>
          {participant.score}
        </span>
        {showScorePop ? (
          <span
            aria-hidden="true"
            className="animate-score-pop pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-500"
          >
            +1
          </span>
        ) : null}
      </span>
    </div>
  );
}

type GameScoreHeaderProps = {
  game: Game;
} & ComponentPropsWithoutRef<"div">;

/**
 * Self + closest rival, shaped by however many other participants the game
 * has: Duel (exactly one other) always shows that opponent, and FFA (2+
 * others) shows whoever's in first place (or 2nd if that's you) plus your
 * own place among the field. Solo Rush has no one to show a rival against,
 * so it's handled separately by RampWorkspaceHeader (SelfScoreBadge + a
 * standalone timer) rather than here.
 */
export default function GameScoreHeader({
  game,
  ...props
}: Readonly<GameScoreHeaderProps>) {
  const user = useUserStore(selectUser);
  const onTimeExpired = useGameTimeExpired(game.gameId);

  const self = game.participants.find((p) => p.userId === user?.id);

  if (!self) {
    return null;
  }

  const others = game.participants.filter((p) => p.userId !== self.userId);

  if (others.length === 0) {
    return null;
  }

  let rival: GameParticipant | undefined;
  let selfPlace: string | undefined;
  let rivalPlace: string | undefined;

  if (others.length === 1) {
    rival = others[0];
  } else {
    const ranked = [...game.participants].sort((a, b) => b.score - a.score);
    const selfRank = ranked.findIndex((p) => p.userId === self.userId) + 1;
    const [first, second] = ranked;

    rival = selfRank === 1 ? second : first;
    selfPlace = `#${selfRank}`;
    rivalPlace = selfRank === 1 ? "2nd" : "1st";
  }

  if (!rival) {
    return null;
  }

  const isTie = self.score === rival.score;
  const isSelfLeading = !isTie && self.score > rival.score;

  return (
    <div className={cn("flex items-center gap-2", props.className)} {...props}>
      <PlayerScore
        participant={self}
        typeOfPlayer="self"
        place={selfPlace}
        isLeading={isSelfLeading}
        isTie={isTie}
      />
      <GameTimer game={game} onTimeExpired={onTimeExpired} />
      <PlayerScore
        participant={rival}
        typeOfPlayer="opponent"
        place={rivalPlace}
        isLeading={!isTie && !isSelfLeading}
        isTie={isTie}
      />
    </div>
  );
}
