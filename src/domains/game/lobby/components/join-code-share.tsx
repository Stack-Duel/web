"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { routerConfig } from "@/shared/router-config";

type JoinCodeShareProps = {
  joinCode: string;
};

async function copyToClipboard(text: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error("Couldn't copy to clipboard.");
  }
}

export default function JoinCodeShare({
  joinCode,
}: Readonly<JoinCodeShareProps>) {
  const [isVisible, setIsVisible] = useState(false);

  const joinLink =
    typeof window !== "undefined"
      ? `${window.location.origin}${routerConfig.joinGame.execute({ code: joinCode })}`
      : "";

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-2.5">
      <p className="text-xs text-muted-foreground">
        Share this code or link with a friend to join your game.
      </p>

      <div className="flex items-center gap-1.5">
        <span
          data-cy="join-code-value"
          className="flex-1 rounded-md border bg-background px-2 py-1 text-center font-mono text-sm tracking-widest"
        >
          {isVisible ? joinCode : "•".repeat(joinCode.length)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title={isVisible ? "Hide code" : "Show code"}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Copy code"
          onClick={() => copyToClipboard(joinCode, "Code copied to clipboard")}
        >
          <Copy size={14} />
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() =>
          copyToClipboard(joinLink, "Invite link copied to clipboard")
        }
      >
        <Link2 size={14} /> Copy invite link
      </Button>
    </div>
  );
}
