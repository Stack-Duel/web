"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { sendGameReaction } from "@/shared/lib/signalr/game-hub-client";
import { QUICK_REACTIONS } from "../quick-reactions";

type RampQuickReactionsProps = {
  gameId: string;
};

/** How long the row disables itself after a send, to curb spam-clicking. Purely a client-side
 *  courtesy. There's no server-side rate limit behind this. */
const SEND_COOLDOWN_MS = 800;

/**
 * A row of one-click emoji reactions, no typing: clicking a button just broadcasts that emoji to
 * everyone watching the game (see GameHub.SendReaction). Renders one button per QUICK_REACTIONS
 * entry, so growing that list is the only change needed to offer more.
 */
export default function RampQuickReactions({
  gameId,
}: Readonly<RampQuickReactionsProps>) {
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  const handleSend = (emoji: string) => {
    setIsCoolingDown(true);
    void sendGameReaction(gameId, emoji);
    setTimeout(() => setIsCoolingDown(false), SEND_COOLDOWN_MS);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 border-t p-2",
        isCoolingDown && "opacity-60"
      )}
    >
      {QUICK_REACTIONS.map((emoji) => (
        <Button
          key={emoji}
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={isCoolingDown}
          aria-label={`React with ${emoji}`}
          className="text-base"
          onClick={() => handleSend(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}
