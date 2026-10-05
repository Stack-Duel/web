"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { routerConfig } from "@/shared/router-config";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useJoinGameByCode } from "@/domains/game/api/join-game-by-code";
import {
  useUserStore,
  selectIsAuthenticated,
} from "@/domains/user/state/user-store";

export default function JoinByCodeDialog() {
  const router = useRouter();
  const isAuthenticated = useUserStore(selectIsAuthenticated);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const { mutate: joinGameByCode, isPending: isJoining } = useJoinGameByCode();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setJoinCode("");
    }
    setIsDialogOpen(open);
  };

  const handleJoin = () => {
    const trimmedCode = joinCode.trim();

    if (!trimmedCode) {
      toast.error("Enter a code to join a game.");
      return;
    }

    if (trimmedCode.length !== 7) {
      toast.error("Codes are 7 characters long. Check for typos.");
      return;
    }

    joinGameByCode(
      { joinCode: trimmedCode },
      {
        onSuccess: (gameId) => {
          setIsDialogOpen(false);
          router.push(routerConfig.gamePlay.execute({ gameId }));
        },
        onError: (error) => {
          toast.error(error.message || "Invalid or expired code.");
        },
      }
    );
  };

  return (
    <>
      <Button
        variant="outline"
        className="gap-2"
        disabled={!isAuthenticated}
        title={isAuthenticated ? undefined : "Sign in to join a game"}
        onClick={() => handleOpenChange(true)}
      >
        <KeyRound size={16} /> Join with code
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join with a code</DialogTitle>
            <DialogDescription>
              Enter the code a friend shared with you to join their game.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. AB2CD3E"
            maxLength={7}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleJoin();
            }}
          />

          <Button onClick={handleJoin} disabled={isJoining}>
            {isJoining ? "Joining..." : "Join game"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
