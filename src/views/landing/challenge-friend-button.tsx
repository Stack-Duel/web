"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { routerConfig } from "@/shared/router-config";
import { GameModeKey } from "@/domains/game/models/game-mode";
import {
  useUserStore,
  selectIsAuthenticated,
} from "@/domains/user/state/user-store";

const CHALLENGE_TARGET = `${routerConfig.games.execute({
  mode: GameModeKey.Duel,
})}&challenge=1`;

export default function ChallengeFriendButton() {
  const isAuthenticated = useUserStore(selectIsAuthenticated);

  if (isAuthenticated) {
    return (
      <Button asChild size="lg" variant="secondary" className="w-40">
        <Link href={CHALLENGE_TARGET}>Challenge a friend</Link>
      </Button>
    );
  }

  return (
    <Button asChild size="lg" variant="secondary" className="w-40">
      <a
        href={`${routerConfig.authLogIn.path}?returnTo=${encodeURIComponent(
          CHALLENGE_TARGET
        )}`}
      >
        Challenge a friend
      </a>
    </Button>
  );
}
