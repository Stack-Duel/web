"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useUpdateStudioProblemMetadata } from "@/domains/studio/api/update-studio-problem-metadata";
import StudioProblemEditTitleField from "./fields/studio-problem-edit-title-field";
import StudioProblemEditQuestionField from "./fields/studio-problem-edit-question-field";
import StudioProblemEditDifficultyField from "./fields/studio-problem-edit-difficulty-field";
import StudioProblemEditLimitField from "./fields/studio-problem-edit-limit-field";
import StudioProblemEditTrackField from "./fields/studio-problem-edit-track-field";
import StudioProblemEditTagsField from "./fields/studio-problem-edit-tags-field";
import StudioProblemEditFooter from "./studio-problem-edit-footer";
import StudioProblemLimitChangeDialog from "./studio-problem-limit-change-dialog";
import { useStudioProblemEditStoreApi } from "./studio-problem-edit-store-context";
import { selectRequiresLimitConfirmation } from "./studio-problem-edit-store";
import { studioProblemEditSchema } from "./studio-problem-edit-schema";
import JsonDataDialog from "@/domains/problem/components/json-data-dialog";
import { parseOrThrow } from "@/domains/problem/models/problem-json-schemas";

type StudioProblemEditMetadataProps = {
  problemId: string;
  trackId: string | null;
};

export default function StudioProblemEditMetadata({
  problemId,
  trackId,
}: Readonly<StudioProblemEditMetadataProps>) {
  const store = useStudioProblemEditStoreApi();
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);

  const { mutate: save, isPending } = useUpdateStudioProblemMetadata({
    mutationConfig: {
      onSuccess: () => {
        store.getState().markDraftSaved();
        toast.success("Saved problem metadata");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save problem metadata");
      },
    },
  });

  const saveDraft = () => {
    const { draft } = store.getState();

    save({
      problemId,
      title: draft.title.trim(),
      question: draft.question.trim(),
      difficulty: draft.estimatedDifficulty,
      timeLimitMs: draft.timeLimitMs,
      memoryLimitMb: draft.memoryLimitMB,
      tags: draft.tags,
    });
  };

  const handleSubmit = () => {
    if (!store.getState().validateDraft()) {
      toast.error("Fix the highlighted fields before saving.");
      return;
    }

    if (selectRequiresLimitConfirmation(store.getState())) {
      setIsLimitDialogOpen(true);
      return;
    }

    saveDraft();
  };

  const handleConfirmLimitChange = () => {
    setIsLimitDialogOpen(false);
    saveDraft();
  };

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Title, question, difficulty, and the limits every submission runs
              under.
            </CardDescription>
          </div>
          <JsonDataDialog
            title="Details JSON"
            description="Edit the details as JSON, then apply them to the form. Nothing is saved until you press save."
            isDisabled={isPending}
            getCurrentJson={() => store.getState().draft}
            onApply={(parsed) =>
              store
                .getState()
                .replaceDraft(parseOrThrow(studioProblemEditSchema, parsed))
            }
          />
        </CardHeader>
        <CardContent className="@container space-y-4 mb-4">
          <StudioProblemEditTitleField />
          <StudioProblemEditQuestionField />
          <div className="grid gap-4 @md:grid-cols-2">
            <StudioProblemEditDifficultyField />
            <StudioProblemEditTrackField trackId={trackId} />
          </div>
          <div className="grid gap-4 @md:grid-cols-2">
            <StudioProblemEditLimitField field="timeLimitMs" />
            <StudioProblemEditLimitField field="memoryLimitMB" />
          </div>
          <StudioProblemEditTagsField />
        </CardContent>
        <CardFooter className="sticky bottom-0 z-10">
          <StudioProblemEditFooter isSaving={isPending} />
        </CardFooter>
      </form>
      <StudioProblemLimitChangeDialog
        isOpen={isLimitDialogOpen}
        onOpenChange={setIsLimitDialogOpen}
        onConfirm={handleConfirmLimitChange}
      />
    </Card>
  );
}
