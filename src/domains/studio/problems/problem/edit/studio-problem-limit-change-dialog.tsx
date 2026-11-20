"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useStudioProblemEditStore } from "./studio-problem-edit-store-context";

type StudioProblemLimitChangeDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
};

export default function StudioProblemLimitChangeDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: Readonly<StudioProblemLimitChangeDialogProps>) {
  const attemptCount = useStudioProblemEditStore((state) => state.attemptCount);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Change the limits on a published problem?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This problem is published and has {attemptCount} recorded{" "}
            {attemptCount === 1 ? "attempt" : "attempts"}. Changing the time or
            memory limit can invalidate solutions that already passed, so it
            counts as a structural change rather than a wording fix.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep the current limits</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Save the new limits
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
