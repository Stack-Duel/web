"use client";

import JsonUploadDialog from "./json-upload-dialog";
import { useSetProblemSampleTestCases } from "../api/set-problem-sample-test-cases";
import { sampleTestCasesUploadSchema } from "../schemas/sample-test-cases-upload-schema";
import { formatZodError } from "../schemas/format-zod-error";

const exampleJson = JSON.stringify(
  [
    {
      name: "Example 1",
      inputs: [
        { value: "[2,7,11,15]", valueType: "integer_array" },
        { value: "9", valueType: "integer" },
      ],
      expectedOutputValue: "[0,1]",
      expectedOutputValueType: "integer_array",
    },
  ],
  null,
  2
);

type UploadSampleTestCasesJsonButtonProps = {
  problemId: string;
};

export default function UploadSampleTestCasesJsonButton({
  problemId,
}: Readonly<UploadSampleTestCasesJsonButtonProps>) {
  const { mutateAsync: setTestCases } = useSetProblemSampleTestCases();

  const handleSubmit = async (parsed: unknown) => {
    const result = sampleTestCasesUploadSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    await setTestCases({ problemId, testCases: result.data });
  };

  return (
    <JsonUploadDialog
      triggerLabel="Upload JSON"
      title="Upload sample test cases"
      description="Paste or upload a JSON array of sample test cases. This replaces every sample test case on the problem — the same set is shared across all of its language setups, not per-language. Supported valueType values: integer, double, boolean, string, integer_array."
      exampleJson={exampleJson}
      onSubmit={handleSubmit}
    />
  );
}
