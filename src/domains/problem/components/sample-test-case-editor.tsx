"use client";

import { toast } from "sonner";
import { useSetProblemSampleTestCases } from "../api/set-problem-sample-test-cases";
import SampleTestCaseForm from "./sample-test-case-form";
import type { SampleTestCase } from "../models/sample-test-case";

type SampleTestCaseEditorProps = {
  problemId: string;
  initialTestCases: SampleTestCase[];
};

export default function SampleTestCaseEditor({
  problemId,
  initialTestCases,
}: Readonly<SampleTestCaseEditorProps>) {
  const { mutate: save, isPending } = useSetProblemSampleTestCases();

  return (
    <SampleTestCaseForm
      initialTestCases={initialTestCases}
      isSaving={isPending}
      onSave={(testCases) =>
        save(
          { problemId, testCases },
          {
            onSuccess: () => toast.success("Saved sample test cases"),
            onError: (error) =>
              toast.error(error.message || "Failed to save sample test cases"),
          }
        )
      }
    />
  );
}
