"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import { useRemoveStudioProblemSetup } from "@/domains/studio/api/remove-studio-problem-setup";

type StudioProblemSetupDeleteButtonProps = {
  problemId: string;
  languageVersionId: string;
  languageLabel: string;
  testCaseCount: string;
};

export default function StudioProblemSetupDeleteButton({
  problemId,
  languageVersionId,
  languageLabel,
  testCaseCount,
}: Readonly<StudioProblemSetupDeleteButtonProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const parsedTestCaseCount = Number(testCaseCount) || 0;
  const { mutate: removeSetup, isPending } = useRemoveStudioProblemSetup();

  const handleDelete = () => {
    removeSetup(
      { problemId, languageVersionId },
      {
        onSuccess: () => {
          toast.success(`${languageLabel} setup removed`);
          setIsOpen(false);
        },
        onError: (error) =>
          toast.error(error.message || `Failed to remove ${languageLabel}`),
      }
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove ${languageLabel} setup`}
          onClick={(event) => event.stopPropagation()}
        >
          <Trash2 size={16} className="text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {languageLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            {parsedTestCaseCount > 0
              ? `This deletes the ${languageLabel} starter code, reference solution, and ${parsedTestCaseCount} test case${parsedTestCaseCount === 1 ? "" : "s"}. This cannot be undone.`
              : `This deletes the ${languageLabel} starter code and reference solution. This cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
          >
            {isPending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
