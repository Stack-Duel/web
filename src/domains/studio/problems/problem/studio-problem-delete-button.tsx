"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { routerConfig } from "@/shared/router-config";
import { useDeleteStudioProblem } from "@/domains/studio/api/delete-studio-problem";
import { useStudioProblemDeletionImpact } from "@/domains/studio/api/get-studio-problem-deletion-impact";

type StudioProblemDeleteButtonProps = {
  problemId: string;
  title: string;
  isPublished: boolean;
  className?: string;
};

export default function StudioProblemDeleteButton({
  problemId,
  title,
  isPublished,
  className,
}: Readonly<StudioProblemDeleteButtonProps>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const { mutate: deleteProblem, isPending } = useDeleteStudioProblem();
  const { data: impact } = useStudioProblemDeletionImpact({
    problemId,
    queryConfig: { enabled: isOpen },
  });

  const matchesTitle = typedTitle.trim() === title;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setTypedTitle("");
  };

  const handleDelete = () => {
    deleteProblem(
      { problemId, confirmationTitle: typedTitle.trim() },
      {
        onSuccess: (outcome) => {
          toast.success(
            outcome === "Removed"
              ? "Removed. It has history, so the record was kept but it is gone from every listing."
              : "Problem deleted"
          );
          handleOpenChange(false);
          router.push(routerConfig.studioProblems.path);
        },
        onError: (error) =>
          toast.error(error.message || "Failed to delete problem"),
      }
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className={className}>
          <Trash2 size={16} /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this problem?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                {isPublished
                  ? "This problem is published. If anyone has solved it or played it in a game, the record is kept so their history survives, but the problem disappears from every listing and can never be picked again."
                  : "This draft has never been solved or played, so it will be permanently deleted."}
              </p>
              <p>Any game still in progress keeps working until it finishes.</p>
              {impact?.isInPlay ? (
                <p className="font-medium">
                  {impact.unfinishedGameCount === 1
                    ? "1 game is playing this problem right now."
                    : impact.unfinishedGameCount +
                      " games are playing this problem right now."}
                </p>
              ) : null}
              {impact && impact.submissionCount > 0 ? (
                <p>
                  {impact.submissionCount === 1
                    ? "1 submission has been made against it."
                    : impact.submissionCount +
                      " submissions have been made against it."}
                </p>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="studio-problem-delete-confirmation">
            Type <span className="font-semibold">{title}</span> to confirm
          </Label>
          <Input
            id="studio-problem-delete-confirmation"
            value={typedTitle}
            autoComplete="off"
            onChange={(event) => setTypedTitle(event.target.value)}
            disabled={isPending}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!matchesTitle || isPending}
            onClick={handleDelete}
          >
            {isPending ? "Deleting..." : "Delete problem"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
