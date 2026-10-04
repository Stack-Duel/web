"use client";

import { SkipForward } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import { useSkipProblem } from "@/domains/game/hooks/use-skip-problem";
import type { Game } from "../models/game";

type SkipProblemButtonProps = {
  game: Game;
  problemId: string | null | undefined;
  disabled?: boolean;
  className?: string;
};

export default function SkipProblemButton({
  game,
  problemId,
  disabled = false,
  className,
}: Readonly<SkipProblemButtonProps>) {
  const user = useUserStore(selectUser);
  const self = game.participants.find((p) => p.userId === user?.id);
  const { skip, isSkipping } = useSkipProblem();

  if (game.skipsEnabled === false || !self) {
    return null;
  }

  const skipsRemaining = self.skipsRemaining ?? 0;
  const isDisabled =
    disabled || isSkipping || !problemId || skipsRemaining <= 0;

  const onSkip = () => {
    if (!problemId) return;
    void skip({ gameId: game.gameId, problemId });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className={className}
      disabled={isDisabled}
      onClick={onSkip}
      title={
        skipsRemaining <= 0
          ? "No skips remaining"
          : `Skip this problem (${skipsRemaining} left)`
      }
    >
      <SkipForward size={14} />
      Skip ({skipsRemaining})
    </Button>
  );
}
