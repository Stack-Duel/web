"use client";

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import GenerationParametersForm from "@/domains/problem/components/generation-parameters-form";
import { useSetStudioProblemGenerationParameters } from "@/domains/studio/api/set-studio-problem-generation-parameters";
import type { StudioProblemDetails } from "@/domains/studio/models/studio-problem-details";

type StudioProblemEditGenerationParametersProps = {
  details: StudioProblemDetails;
};

export default function StudioProblemEditGenerationParameters({
  details,
}: Readonly<StudioProblemEditGenerationParametersProps>) {
  const { mutate: save, isPending } = useSetStudioProblemGenerationParameters();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <GenerationParametersForm
          initialParameters={details.generationParameters ?? []}
          initialOutputValueType={details.generationOutputValueType}
          initialTargetCaseCount={details.generationTargetCaseCount}
          initialSeed={details.generationSeed}
          isSaving={isPending}
          onSave={(values) =>
            save(
              { problemId: details.problemId, ...values },
              {
                onSuccess: () => toast.success("Saved generation parameters"),
                onError: (error) =>
                  toast.error(
                    error.message || "Failed to save generation parameters"
                  ),
              }
            )
          }
        />
      </CardContent>
    </Card>
  );
}
