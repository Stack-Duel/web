"use client";

import { Trophy } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import type { Game } from "../models/game";

type SelfScoreBadgeProps = {
  game: Game;
};

export default function SelfScoreBadge({
  game,
}: Readonly<SelfScoreBadgeProps>) {
  const user = useUserStore(selectUser);
  const self = game.participants.find((p) => p.userId === user?.id);

  if (!self) {
    return null;
  }

  return (
    <Badge variant="secondary" className="h-8 gap-1.5 px-3 text-sm">
      <Trophy size={14} className="text-amber-500" />
      Score: <span className="tabular-nums">{self.score}</span>
    </Badge>
  );
}
