"use client";

import { AnimatePresence, motion } from "motion/react";
import { Swords, Users } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import type { Game, GameParticipant } from "../../models/game";
import { useDuelHeadToHead } from "../../api/get-duel-head-to-head";

type GameStartingModalProps = {
  game: Game;
  secondsRemaining: number;
};

function CompetitorCard({
  participant,
  isCurrentUser,
}: Readonly<{ participant: GameParticipant; isCurrentUser: boolean }>) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-16 sm:size-20">
        <AvatarImage src={participant.imageUrl} alt={participant.username} />
        <AvatarFallback className="text-lg">
          {participant.username?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <span className="max-w-28 truncate text-sm font-semibold sm:max-w-36 sm:text-base">
        {participant.username}
        {isCurrentUser ? " (You)" : ""}
      </span>
    </div>
  );
}

function RecordPip({
  count,
  label,
  className,
}: Readonly<{ count: number; label: string; className: string }>) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`text-xl font-bold tabular-nums sm:text-2xl ${className}`}
      >
        {count}
      </span>
      <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

function DuelMatchup({ opponent }: Readonly<{ opponent: GameParticipant }>) {
  const { data: record } = useDuelHeadToHead({
    opponentId: opponent.userId,
  });

  if (!record || record.gamesPlayed === 0) {
    return (
      <span className="text-sm text-muted-foreground">
        First time playing {opponent.username} in Duel. Good luck!
      </span>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-muted/30 px-4 py-2">
      <RecordPip
        count={record.wins}
        label="Wins"
        className="text-emerald-600 dark:text-emerald-400"
      />
      <RecordPip
        count={record.draws}
        label="Draws"
        className="text-muted-foreground"
      />
      <RecordPip
        count={record.losses}
        label="Losses"
        className="text-rose-600 dark:text-rose-400"
      />
    </div>
  );
}

export default function GameStartingModal({
  game,
  secondsRemaining,
}: Readonly<GameStartingModalProps>) {
  const user = useUserStore(selectUser);
  const isDuel = game.participants.length === 2;
  const opponent = isDuel
    ? game.participants.find((p) => p.userId !== user?.id)
    : undefined;

  const countdownLabel =
    secondsRemaining > 1 ? String(secondsRemaining - 1) : "GO!";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background/95 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm font-medium tracking-widest text-muted-foreground uppercase">
        {isDuel ? <Swords size={16} /> : <Users size={16} />}
        {isDuel ? "Duel" : "Free-for-all"} starting
      </div>

      {isDuel && opponent ? (
        <div className="flex items-center gap-6 sm:gap-10">
          <CompetitorCard
            participant={
              game.participants.find((p) => p.userId === user?.id) ?? opponent
            }
            isCurrentUser={true}
          />
          <span className="text-2xl font-black text-muted-foreground italic">
            VS
          </span>
          <CompetitorCard participant={opponent} isCurrentUser={false} />
        </div>
      ) : (
        <div className="flex max-w-xl flex-wrap items-start justify-center gap-6">
          {game.participants.map((participant) => (
            <CompetitorCard
              key={participant.userId}
              participant={participant}
              isCurrentUser={participant.userId === user?.id}
            />
          ))}
        </div>
      )}

      {isDuel && opponent ? <DuelMatchup opponent={opponent} /> : null}

      <AnimatePresence mode="wait">
        <motion.span
          key={countdownLabel}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-6xl font-black tabular-nums text-primary sm:text-7xl"
        >
          {countdownLabel}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
