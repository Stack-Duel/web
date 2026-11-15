"use client";

import { useForm } from "@tanstack/react-form";
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

type StudioProblemNewMetadataProps = {
  initialStudioProblemSetup: InitialStudioProblemSetup;
};

export default function StudioProblemNewMetadata({
  initialStudioProblemSetup,
}: Readonly<StudioProblemNewMetadataProps>) {
  const { availableTracks } = initialStudioProblemSetup;

  const form = useForm({
    defaultValues: selectDraft(useNewStudioProblemStore.getState()),
    validators: {
      onBlur: newStudioProblemSchema,
      onSubmit: newStudioProblemSchema,
    },
    onSubmit: async () => {
      toast.success("Draft saved");
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
          <form.Field name="trackId">
            {(field) => (
              <StudioProblemTrackField
                field={field}
                availableTracks={availableTracks}
              />
            )}
          </form.Field>
          <form.Field name="tags">
            {(field) => <StudioProblemTagsField field={field} />}
          </form.Field>
        </CardContent>
        <CardFooter>
          <form.Subscribe
            selector={(state) => [state.isSubmitting, state.canSubmit]}
          >
            {([isSubmitting, canSubmit]) => (
              <StudioProblemNewFooter
                isSubmitting={isSubmitting}
                canSubmit={canSubmit}
              />
            )}
          </form.Subscribe>
        </CardFooter>
      </form>
    </Card>
  );
}
