"use client";

import { toast } from "sonner";
import { Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import SampleTestCaseForm from "@/domains/problem/components/sample-test-case-form";
import { useSuspenseStudioProblemSetups } from "@/domains/studio/api/get-studio-problem-setups";
import { useSetStudioProblemSampleTestCases } from "@/domains/studio/api/set-studio-problem-sample-test-cases";

export default function StudioProblemEditSampleCases({
  problemId,
}: Readonly<{ problemId: string }>) {
  const { data: setups } = useSuspenseStudioProblemSetups({ problemId });
  const { mutate: save, isPending } = useSetStudioProblemSampleTestCases();

  const initialTestCases = setups[0]?.sampleTestCases ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample test cases</CardTitle>
        <CardDescription>
          The cases players see in the question, and the ones every reference
          solution has to pass.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {setups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a language setup first. Sample cases are stored against the
            problem&apos;s setups.
          </p>
        ) : (
          <>
            <SampleTestCaseForm
              key={problemId}
              initialTestCases={initialTestCases}
              isSaving={isPending}
              saveLabel="Save sample cases"
              onSave={(testCases) =>
                save(
                  { problemId, testCases },
                  {
                    onSuccess: () => toast.success("Saved sample cases"),
                    onError: (error) =>
                      toast.error(
                        error.message || "Failed to save sample cases"
                      ),
                  }
                )
              }
            />
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              Saving replaces the whole sample set at once, and every reference
              solution is re-run against it during validation.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
