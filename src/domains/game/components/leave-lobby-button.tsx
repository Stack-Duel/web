"use client";

import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { useLeaveGame } from "../api/leave-game";

type LeaveLobbyButtonProps = {
  gameId: string;
  size?: "sm" | "default";
  variant?: "ghost" | "secondary" | "outline" | "destructive";
  className?: string;
  onLeft?: () => void;
};

/** Confirm-before-leave button for a still-Pending lobby. Shared by every place that can show
 *  one: the sidebar's active-games card, the open-lobbies table, and "my active games", so the
 *  dialog copy and behavior stay in exactly one place. */
export default function LeaveLobbyButton({
  gameId,
  size = "sm",
  variant = "ghost",
  className,
  onLeft,
}: Readonly<LeaveLobbyButtonProps>) {
  const { mutate: leave, isPending: isLeaving } = useLeaveGame();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size={size}
          variant={variant}
          disabled={isLeaving}
          className={className}
          onClick={(event) => event.stopPropagation()}
        >
          <LogOut size={14} /> Leave
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave this lobby?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ll need to join again to get your spot back.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => leave({ gameId }, { onSuccess: onLeft })}
          >
            Leave lobby
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
