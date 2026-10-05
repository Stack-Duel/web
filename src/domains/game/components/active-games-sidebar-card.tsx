"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Hourglass, Swords, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { routerConfig } from "@/shared/router-config";
import {
  useUserStore,
  selectIsAuthenticated,
} from "@/domains/user/state/user-store";
import { useMyActiveGames } from "../api/get-my-active-games";
import { GameStatus } from "../models/game";
import type { MyActiveGame } from "../models/my-active-game";
import LeaveLobbyButton from "./leave-lobby-button";

const DISMISSED_STORAGE_KEY = "algowars:dismissed-active-games";

function getDismissalKey(games: MyActiveGame[]) {
  return games
    .map((game) => `${game.gameId}:${game.status}`)
    .sort()
    .join(",");
}

/**
 * Sidebar card (rendered above SidebarUser in app-sidebar.tsx) surfacing the games the
 * current user has in progress. Replaces the old top-of-page ActiveGameBanner: a card
 * sitting in the sidebar is far less intrusive than a full-width banner pushing page
 * content down, while still being reachable from every page that has a sidebar.
 */
export default function ActiveGamesSidebarCard() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useUserStore(selectIsAuthenticated);
  const { data: games } = useMyActiveGames(isAuthenticated);

  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const previousStatusByGameId = useRef<Map<string, GameStatus>>(new Map());

  useEffect(() => {
    if (!games) return;

    for (const game of games) {
      const previousStatus = previousStatusByGameId.current.get(game.gameId);
      const isOnGamePage =
        pathname === routerConfig.gamePlay.execute({ gameId: game.gameId });
      if (
        previousStatus === GameStatus.Pending &&
        game.status === GameStatus.Running &&
        !isOnGamePage
      ) {
        toast.success(`Your ${game.gameModeName} game has started!`, {
          duration: 10_000,
          action: {
            label: "Go to game",
            onClick: () =>
              router.push(
                routerConfig.gamePlay.execute({ gameId: game.gameId })
              ),
          },
        });
      }
    }

    previousStatusByGameId.current = new Map(
      games.map((game) => [game.gameId, game.status])
    );
  }, [games, pathname, router]);

  if (!games || games.length === 0) return null;

  const isHiddenOnThisRoute =
    games.length > 1
      ? pathname === routerConfig.games.execute()
      : pathname === routerConfig.gamePlay.execute({ gameId: games[0].gameId });

  const dismissalKey = getDismissalKey(games);
  if (isHiddenOnThisRoute || dismissalKey === dismissedKey) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, dismissalKey);
    } catch {}
    setDismissedKey(dismissalKey);
  };

  return games.length > 1 ? (
    <MultipleGamesCard count={games.length} onDismiss={dismiss} />
  ) : (
    <SingleGameCard game={games[0]} onDismiss={dismiss} />
  );
}

const cardClassName =
  "relative rounded-lg border border-green-600/30 bg-green-50 p-3 text-sm dark:border-green-500/30 dark:bg-green-950/40";
const dismissButtonClassName =
  "absolute right-1.5 top-1.5 text-green-800/50 hover:bg-green-600/10 hover:text-green-800 dark:text-green-300/50 dark:hover:bg-green-400/10 dark:hover:text-green-300";
const titleClassName =
  "flex items-start gap-2 pr-5 font-medium text-green-900 dark:text-green-200";
const primaryButtonClassName =
  "w-full justify-center gap-1.5 border-transparent bg-green-600 text-white hover:bg-green-600/90 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-500/90";
const secondaryButtonClassName =
  "w-full justify-center gap-1.5 border-green-600/40 bg-transparent text-green-800 hover:bg-green-600/10 dark:border-green-400/40 dark:text-green-300 dark:hover:bg-green-400/10";

function SingleGameCard({
  game,
  onDismiss,
}: Readonly<{ game: MyActiveGame; onDismiss: () => void }>) {
  const router = useRouter();
  const isPending = game.status === GameStatus.Pending;

  const goToGame = () =>
    router.push(routerConfig.gamePlay.execute({ gameId: game.gameId }));

  return (
    <div className={cardClassName}>
      <Button
        size="icon-xs"
        variant="ghost"
        className={dismissButtonClassName}
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X size={14} />
      </Button>

      <div className={titleClassName}>
        {isPending ? (
          <Hourglass size={16} className="mt-0.5 shrink-0" />
        ) : (
          <Swords size={16} className="mt-0.5 shrink-0" />
        )}
        <span>
          {isPending
            ? `Waiting in a ${game.gameModeName} lobby (${game.participantCount}/${game.maxPlayers})`
            : `${game.gameModeName} game in progress`}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          className={primaryButtonClassName}
          onClick={goToGame}
        >
          {isPending ? "Go to lobby" : "Go to game"}
          <ArrowRight size={14} />
        </Button>

        {isPending ? (
          <LeaveLobbyButton
            gameId={game.gameId}
            variant="outline"
            className={secondaryButtonClassName}
          />
        ) : null}
      </div>
    </div>
  );
}

function MultipleGamesCard({
  count,
  onDismiss,
}: Readonly<{ count: number; onDismiss: () => void }>) {
  const router = useRouter();

  return (
    <div className={cardClassName}>
      <Button
        size="icon-xs"
        variant="ghost"
        className={dismissButtonClassName}
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X size={14} />
      </Button>

      <div className={titleClassName}>
        <Swords size={16} className="mt-0.5 shrink-0" />
        <span>You have {count} active games</span>
      </div>

      <Button
        size="sm"
        variant="outline"
        className={`mt-3 ${primaryButtonClassName}`}
        onClick={() => router.push(routerConfig.games.execute())}
      >
        View my games
        <ArrowRight size={14} />
      </Button>
    </div>
  );
}
