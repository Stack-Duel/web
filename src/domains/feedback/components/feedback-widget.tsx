"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { FeedbackDialog } from "./feedback-dialog";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        size="icon-lg"
        className="fixed bottom-6 end-6 z-40 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <MessageSquarePlus />
        <span className="sr-only">Give feedback</span>
      </Button>
      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
