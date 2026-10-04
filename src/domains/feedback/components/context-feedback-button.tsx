"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { FeedbackDialog, type FeedbackDialogContext } from "./feedback-dialog";

type ContextFeedbackButtonProps = FeedbackDialogContext & {
  className?: string;
};

export function ContextFeedbackButton({
  type,
  entityId,
  className,
}: Readonly<ContextFeedbackButtonProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("gap-2", className)}
        onClick={() => setOpen(true)}
      >
        <MessageSquarePlus />
        Feedback
      </Button>
      <FeedbackDialog
        open={open}
        onOpenChange={setOpen}
        context={{ type, entityId }}
      />
    </>
  );
}
