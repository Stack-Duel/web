"use client";

import JsonUploadDialog from "./json-upload-dialog";
import { useSetProblemGenerationParameters } from "../api/set-problem-generation-parameters";
import { generationParametersUploadSchema } from "../schemas/generation-parameters-upload-schema";
import { formatZodError } from "../schemas/format-zod-error";

const exampleJson = JSON.stringify(
  {
    parameters: [
      {
        name: "nums",
        valueType: "integer_array",
        min: -1000,
        max: 1000,
        lengthMin: 2,
        lengthMax: 20,
        charset: null,
      },
      {
        name: "target",
        valueType: "integer",
        min: -1000,
        max: 1000,
        lengthMin: null,
        lengthMax: null,
        charset: null,
      },
    ],
    outputValueType: "integer_array",
    targetCaseCount: 20,
    seed: 12345,
  },
  null,
  2
);

type UploadGenerationParametersJsonButtonProps = {
  problemId: string;
};

export default function UploadGenerationParametersJsonButton({
  problemId,
}: Readonly<UploadGenerationParametersJsonButtonProps>) {
  const { mutateAsync: setParameters } = useSetProblemGenerationParameters();

  const handleSubmit = async (parsed: unknown) => {
    const result = generationParametersUploadSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    await setParameters({ problemId, ...result.data });
  };

  return (
    <JsonUploadDialog
      triggerLabel="Upload JSON"
      title="Upload generation parameters"
      description="Paste or upload JSON describing how hidden test cases are randomly generated for this problem. This isn't literal test case values — it's constraints (per-parameter min/max/length/charset) fed to a seeded generator. Supported valueType values: integer, double, boolean, string, integer_array."
      exampleJson={exampleJson}
      onSubmit={handleSubmit}
    />
  );
}
