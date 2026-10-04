"use client";

import { useEffect, useState } from "react";
import { FeedbackDialog } from "./feedback-dialog";

const STORAGE_KEY = "algowars:has-seen-first-game-feedback-prompt";

type FirstGameFeedbackPromptProps = {
  gameId: string;
};

export function FirstGameFeedbackPrompt({
  gameId,
}: Readonly<FirstGameFeedbackPromptProps>) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      localStorage.setItem(STORAGE_KEY, "true");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    } catch {}
  }, []);

  return (
    <FeedbackDialog
      open={open}
      onOpenChange={setOpen}
      context={{ type: "Game", entityId: gameId }}
      description="Thanks for playing your first game! Tell us how it went."
    />
  );
}
