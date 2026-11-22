"use client";

import { toast } from "sonner";
import { useSetProblemGenerationParameters } from "../api/set-problem-generation-parameters";
import GenerationParametersForm from "./generation-parameters-form";
import type { GenerationParameter } from "../models/generation-parameters";

type GenerationParametersEditorProps = {
  problemId: string;
  initialParameters: GenerationParameter[];
  initialOutputValueType: string | null;
  initialTargetCaseCount: number | null;
  initialSeed: number | null;
};

export default function GenerationParametersEditor({
  problemId,
  initialParameters,
  initialOutputValueType,
  initialTargetCaseCount,
  initialSeed,
}: Readonly<GenerationParametersEditorProps>) {
  const { mutate: save, isPending } = useSetProblemGenerationParameters();

  return (
    <GenerationParametersForm
      initialParameters={initialParameters}
      initialOutputValueType={initialOutputValueType}
      initialTargetCaseCount={initialTargetCaseCount}
      initialSeed={initialSeed}
      isSaving={isPending}
      onSave={(values) =>
        save(
          { problemId, ...values },
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
  );
}
