"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import type { GameWorkspaceProps } from "@/domains/game/models/game-workspace";
import { Game, GameParticipant, GameStatus } from "@/domains/game/models/game";
import ScoreBadge from "@/domains/game/components/score-badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routerConfig } from "@/shared/router-config";
import {
  Crown,
  Home,
  Hourglass,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCreateGameAndPlay } from "@/domains/game/hooks/use-create-game-and-play";
import { useTracks } from "@/domains/game/api/use-tracks";
import { useMyLeaderboardEntry } from "@/domains/leaderboard/api/get-my-leaderboard-entry";
import { fireHighScoreConfetti } from "@/shared/lib/confetti";
import { FirstGameFeedbackPrompt } from "@/domains/feedback/components/first-game-feedback-prompt";

type StandingsSummary = {
  isMultiplayer: boolean;
  topScore: number;
  winners: GameParticipant[];
  isTie: boolean;
  currentUserWon: boolean;
};

function getStandingsSummary(
  game: Game,
  currentUserId: string | undefined
): StandingsSummary {
  const isMultiplayer = game.participants.length > 1;
  const topScore = isMultiplayer
    ? Math.max(...game.participants.map((p) => p.score))
    : 0;
  const winners = isMultiplayer
    ? game.participants.filter((p) => p.score === topScore)
    : [];
  const isTie = winners.length > 1;
  const currentUserWon = winners.some((w) => w.userId === currentUserId);

  return { isMultiplayer, topScore, winners, isTie, currentUserWon };
}

function getGameOverTitle(wasForfeited: boolean, wasFinished: boolean): string {
  if (wasForfeited) {
    return "Game forfeited";
  }
  if (wasFinished) {
    return "All problems solved!";
  }
  return "Time's up";
}

function getSoloDescription(
  wasForfeited: boolean,
  wasFinished: boolean
): string {
  if (wasForfeited) {
    return "This game has ended.";
  }
  if (wasFinished) {
    return "You solved every problem in the pool with time to spare.";
  }
  return "Your game is complete.";
}

function getMultiplayerDescription(summary: StandingsSummary): string {
  const { topScore, winners, isTie, currentUserWon } = summary;
  const pointLabel = `${topScore} point${topScore === 1 ? "" : "s"}`;

  if (isTie) {
    if (currentUserWon) {
      return `Tied for first at ${pointLabel}.`;
    }
    return `${winners.map((w) => w.username).join(" and ")} tied for first at ${pointLabel}.`;
  }
  if (currentUserWon) {
    return "You won!";
  }
  return `${winners[0].username} won with ${pointLabel}.`;
}

function getGameOverDescription(
  summary: StandingsSummary,
  wasForfeited: boolean,
  wasFinished: boolean
): string {
  if (!summary.isMultiplayer) {
    return getSoloDescription(wasForfeited, wasFinished);
  }
  return getMultiplayerDescription(summary);
}

function ParticipantStatusBadge({
  participant,
}: Readonly<{ participant: GameParticipant }>) {
  if (participant.hasForfeited) {
    return <Badge variant="destructive">Forfeited</Badge>;
  }
  if (participant.hasFinishedProblems) {
    return <Badge variant="secondary">Finished</Badge>;
  }
  return null;
}

function StandingRow({
  participant,
  topScore,
  isCurrentUser,
}: Readonly<{
  participant: GameParticipant;
  topScore: number;
  isCurrentUser: boolean;
}>) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5",
        participant.hasForfeited && "opacity-60"
      )}
    >
      <Avatar size="sm">
        <AvatarImage src={participant.imageUrl} alt={participant.username} />
        <AvatarFallback>
          {participant.username?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <span className="flex-1 truncate text-sm font-medium">
        {participant.username}
        {isCurrentUser ? " (You)" : ""}
      </span>
      <ParticipantStatusBadge participant={participant} />
      {participant.score === topScore ? (
        <Crown size={14} className="text-amber-600 dark:text-amber-400" />
      ) : null}
      <span className="text-sm tabular-nums text-muted-foreground">
        {participant.score}
      </span>
    </li>
  );
}

function StandingsList({
  game,
  topScore,
  currentUserId,
}: Readonly<{
  game: Game;
  topScore: number;
  currentUserId: string | undefined;
}>) {
  const sorted = [...game.participants].sort((a, b) => b.score - a.score);

  return (
    <ul className="flex w-full flex-col gap-1.5">
      {sorted.map((participant) => (
        <StandingRow
          key={participant.userId}
          participant={participant}
          topScore={topScore}
          isCurrentUser={participant.userId === currentUserId}
        />
      ))}
    </ul>
  );
}

function LobbyClosedCard({
  isCreating,
  onPlayAgain,
}: Readonly<{ isCreating: boolean; onPlayAgain: () => void }>) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center py-6">
      <Card className="w-full max-w-md">
        <CardHeader className="justify-items-center text-center">
          <XCircle className="mb-2 size-8 text-muted-foreground" />
          <CardTitle>Lobby closed</CardTitle>
          <CardDescription>
            This lobby was closed before the game started.
          </CardDescription>
        </CardHeader>
        <CardFooter className="grid grid-cols-2 gap-2">
          <Button variant="outline" asChild>
            <Link href={routerConfig.home.path}>
              <Home />
              Home
            </Link>
          </Button>
          <Button disabled={isCreating} onClick={onPlayAgain}>
            <RotateCcw />
            {isCreating ? "Starting..." : "Play again"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function WaitingForGameEndCard({
  wasForfeited,
}: Readonly<{ wasForfeited: boolean }>) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center py-6">
      <Card className="w-full max-w-md">
        <CardHeader className="justify-items-center text-center">
          <Hourglass className="mb-2 size-8 text-muted-foreground" />
          <CardTitle>
            {wasForfeited ? "You forfeited" : "You finished"}
          </CardTitle>
          <CardDescription>
            Results will show once the game ends for everyone.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function WinnerTrophy() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -15, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 15 }}
      className="flex flex-col items-center gap-1"
    >
      <Trophy
        className="size-14 text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
        strokeWidth={1.75}
      />
      <span className="text-xs font-bold tracking-widest text-amber-600 uppercase dark:text-amber-400">
        Victory
      </span>
    </motion.div>
  );
}

function HighScoreBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
    >
      <Sparkles size={14} />
      New High Score!
    </Badge>
  );
}

export default function GameOverSummary({
  game,
}: Readonly<GameWorkspaceProps>) {
  const user = useUserStore(selectUser);
  const { createGame, isCreating } = useCreateGameAndPlay();
  const { data: tracks } = useTracks();
  const participant = game.participants.find(
    (candidate) => candidate.userId === user?.id
  );
  const { data: myEntry } = useMyLeaderboardEntry({
    gameModeKey: game.gameModeKey,
    timeLimitInSeconds: game.timeLimitInSeconds,
    queryConfig: {
      enabled: game.status === GameStatus.Completed,
      retry: false,
    },
  });
  const isHighScore =
    !!participant &&
    participant.score > 0 &&
    myEntry?.highScore === participant.score;
  const hasCelebratedHighScore = useRef(false);

  useEffect(() => {
    if (!isHighScore || hasCelebratedHighScore.current) return;
    hasCelebratedHighScore.current = true;
    fireHighScoreConfetti();
  }, [isHighScore]);

  const playAgain = () => {
    const defaultTrack = tracks?.find(
      (track) => track.key === "general-purpose"
    );

    createGame({
      gameModeKey: game.gameModeKey,
      timeLimitInSeconds: game.timeLimitInSeconds,
      trackSelections: defaultTrack
        ? [
            {
              trackKey: defaultTrack.key,
              languageIds: defaultTrack.languages.map(
                (language) => language.id
              ),
            },
          ]
        : [],
    });
  };

  if (game.status === GameStatus.Cancelled) {
    return <LobbyClosedCard isCreating={isCreating} onPlayAgain={playAgain} />;
  }

  const wasForfeited = participant?.hasForfeited === true;
  const wasFinished = participant?.hasFinishedProblems === true;

  if (game.status === GameStatus.Running) {
    return (
      <>
        <FirstGameFeedbackPrompt gameId={game.gameId} />
        <WaitingForGameEndCard wasForfeited={wasForfeited} />
      </>
    );
  }

  const summary = getStandingsSummary(game, user?.id);
  const title = getGameOverTitle(wasForfeited, wasFinished);
  const description = getGameOverDescription(
    summary,
    wasForfeited,
    wasFinished
  );

  const showWinnerTrophy =
    summary.isMultiplayer && !summary.isTie && summary.currentUserWon;

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 py-6">
      <FirstGameFeedbackPrompt gameId={game.gameId} />
      {showWinnerTrophy ? <WinnerTrophy /> : null}
      <Card className="w-full max-w-md">
        <CardHeader className="justify-items-center text-center">
          <Trophy className="mb-2 size-8 text-primary" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <ScoreBadge score={participant?.score ?? 0} />
          {isHighScore ? <HighScoreBadge /> : null}

          {summary.isMultiplayer ? (
            <StandingsList
              game={game}
              topScore={summary.topScore}
              currentUserId={user?.id}
            />
          ) : null}
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2">
          <Button variant="outline" asChild>
            <Link href={routerConfig.home.path}>
              <Home />
              Home
            </Link>
          </Button>
          <Button disabled={isCreating} onClick={playAgain}>
            <RotateCcw />
            {isCreating ? "Starting..." : "Play again"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
