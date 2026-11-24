"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import StudioProblemTitleField from "./fields/studio-problem-title-field";
import StudioProblemQuestionField from "./fields/studio-problem-question-field";
import StudioProblemDifficultyField from "./fields/studio-problem-difficulty-field";
import StudioProblemTimeLimitField from "./fields/studio-problem-time-limit-field";
import StudioProblemMemoryLimitField from "./fields/studio-problem-memory-limit-field";
import StudioProblemTagsField from "./fields/studio-problem-tags-field";
import StudioProblemTrackField from "./fields/studio-problem-track-field";
import StudioProblemNewFooter from "./studio-problem-new-footer";
import { newStudioProblemSchema } from "./new-studio-problem-schema";
import {
  selectDraft,
  useNewStudioProblemStore,
} from "./new-studio-problem-store";
import { InitialStudioProblemSetup } from "@/domains/studio/models/initial-studio-problem-setup";
import NewStudioProblemUploadJSON from "./new-studio-problem-upload-json";
import { useCreateStudioProblem } from "@/domains/studio/api/create-studio-problem";
import { routerConfig } from "@/shared/router-config";

type StudioProblemNewMetadataProps = {
  initialStudioProblemSetup: InitialStudioProblemSetup;
};

export default function StudioProblemNewMetadata({
  initialStudioProblemSetup,
}: Readonly<StudioProblemNewMetadataProps>) {
  const { availableTracks } = initialStudioProblemSetup;
  const router = useRouter();
  const resetDraft = useNewStudioProblemStore((state) => state.reset);

  const mutation = useCreateStudioProblem({
    mutationConfig: {
      onSuccess: (id) => {
        toast.success("Problem created");
        resetDraft();
        router.push(routerConfig.studioProblemDetail.execute({ id }));
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create problem");
      },
    },
  });

  const form = useForm({
    defaultValues: selectDraft(useNewStudioProblemStore.getState()),
    validators: {
      onChange: newStudioProblemSchema,
      onSubmit: newStudioProblemSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        title: value.title,
        question: value.question,
        difficulty: value.estimatedDifficulty,
        timeLimitMs: value.timeLimitMs,
        memoryLimitMb: value.memoryLimitMB,
        tags: value.tags,
        trackId: value.trackId,
      });
    },
  });

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <CardHeader className="flex justify-between items-center">
          <CardTitle>New Problem</CardTitle>
          <NewStudioProblemUploadJSON
            form={form}
            availableTracks={availableTracks}
          />
        </CardHeader>
        <CardContent className="@container space-y-4 mb-4">
          <form.Field name="title">
            {(field) => <StudioProblemTitleField field={field} />}
          </form.Field>
          <form.Field name="question">
            {(field) => <StudioProblemQuestionField field={field} />}
          </form.Field>
          <div className="grid gap-4 @md:grid-cols-3">
            <form.Field name="estimatedDifficulty">
              {(field) => <StudioProblemDifficultyField field={field} />}
            </form.Field>
            <form.Field name="timeLimitMs">
              {(field) => <StudioProblemTimeLimitField field={field} />}
            </form.Field>
            <form.Field name="memoryLimitMB">
              {(field) => <StudioProblemMemoryLimitField field={field} />}
            </form.Field>
          </div>
          <form.Field name="tags">
            {(field) => <StudioProblemTagsField field={field} />}
          </form.Field>
          <form.Field name="trackId">
            {(field) => (
              <StudioProblemTrackField
                field={field}
                availableTracks={availableTracks}
              />
            )}
          </form.Field>
        </CardContent>
        <CardFooter>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <StudioProblemNewFooter
                isSubmitting={isSubmitting || mutation.isPending}
              />
            )}
          </form.Subscribe>
        </CardFooter>
      </form>
    </Card>
  );
}
