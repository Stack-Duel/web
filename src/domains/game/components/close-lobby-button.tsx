"use client";

import { XCircle } from "lucide-react";
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
import { useCloseLobby } from "../api/close-lobby";

type CloseLobbyButtonProps = {
  gameId: string;
  className?: string;
};

/** Host-only "shut the whole lobby down" action. Distinct from LeaveLobbyButton, which only
 *  removes the caller and hands host duties to whoever's next if others remain. Only valid
 *  while the game is still Pending (enforced server-side too); ends it for everyone, not just
 *  the host, so this gets a destructive-styled confirm rather than Leave's neutral one. */
export default function CloseLobbyButton({
  gameId,
  className,
}: Readonly<CloseLobbyButtonProps>) {
  const { mutate: close, isPending: isClosing } = useCloseLobby();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          disabled={isClosing}
          className={className}
          onClick={(event) => event.stopPropagation()}
        >
          <XCircle size={14} /> Close lobby
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close this lobby?</AlertDialogTitle>
          <AlertDialogDescription>
            Everyone currently in it will be removed, and it won&apos;t be
            joinable anymore. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => close({ gameId })}
          >
            Close lobby
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
