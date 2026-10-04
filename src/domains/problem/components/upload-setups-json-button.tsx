"use client";

import JsonUploadDialog from "./json-upload-dialog";
import { useUpsertProblemSetupReferenceSolution } from "../api/upsert-problem-setup-reference-solution";
import { setupsUploadSchema } from "../schemas/setups-upload-schema";
import { formatZodError } from "../schemas/format-zod-error";

const exampleJson = JSON.stringify(
  [
    {
      languageVersionId: "00000000-0000-0000-0000-000000000000",
      initialCode: "function twoSum(nums, target) {\n  \n}",
      functionName: "twoSum",
      referenceSolutionCode:
        "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) return [seen.get(complement), i];\n    seen.set(nums[i], i);\n  }\n}",
    },
  ],
  null,
  2
);

type UploadSetupsJsonButtonProps = {
  problemId: string;
};

export default function UploadSetupsJsonButton({
  problemId,
}: Readonly<UploadSetupsJsonButtonProps>) {
  const { mutateAsync: upsertSetup } = useUpsertProblemSetupReferenceSolution();

  const handleSubmit = async (parsed: unknown) => {
    const result = setupsUploadSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const total = result.data.length;
    for (const [index, setup] of result.data.entries()) {
      try {
        await upsertSetup({ problemId, ...setup });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        throw new Error(
          `${index} of ${total} setup(s) uploaded before setup ${index + 1} failed: ${message}. Each entry is an upsert, so re-uploading the same file is safe.`
        );
      }
    }
  };

  return (
    <JsonUploadDialog
      triggerLabel="Upload JSON"
      title="Upload language setups"
      description="Paste or upload a JSON array of language setups. Each entry creates the setup if it doesn't exist yet, or updates it if it does. languageVersionId must be an existing language version's id."
      exampleJson={exampleJson}
      onSubmit={handleSubmit}
    />
  );
}
