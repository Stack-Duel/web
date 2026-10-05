"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import SolutionEditor from "@/domains/workspace/solution-editor/components/solution-editor";
import { useUpsertProblemSetupReferenceSolution } from "../api/upsert-problem-setup-reference-solution";
import type { AdminProblemSetup } from "../models/admin-problem";

type ReferenceSolutionEditorProps = {
  problemId: string;
  setup: AdminProblemSetup;
};

export default function ReferenceSolutionEditor({
  problemId,
  setup,
}: Readonly<ReferenceSolutionEditorProps>) {
  const [initialCode, setInitialCode] = useState(setup.initialCode);
  const [functionName, setFunctionName] = useState(setup.functionName ?? "");
  const [referenceSolutionCode, setReferenceSolutionCode] = useState(
    setup.referenceSolutionCode ?? ""
  );

  const { mutate: save, isPending } = useUpsertProblemSetupReferenceSolution();

  const handleSave = () => {
    if (!referenceSolutionCode.trim()) {
      toast.error("A reference solution is required.");
      return;
    }

    save(
      {
        problemId,
        languageVersionId: setup.languageVersionId,
        initialCode,
        functionName: functionName.trim() || null,
        referenceSolutionCode,
      },
      {
        onSuccess: () =>
          toast.success(`Saved ${setup.languageName} reference solution`),
        onError: (error) =>
          toast.error(error.message || "Failed to save reference solution"),
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`function-name-${setup.id}`}>Function name</Label>
        <Input
          id={`function-name-${setup.id}`}
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Starter code</Label>
          <div className="h-64 overflow-hidden rounded-md border">
            <SolutionEditor
              languageName={setup.languageName}
              value={initialCode}
              onChange={setInitialCode}
              editable={!isPending}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Reference solution</Label>
          <div className="h-64 overflow-hidden rounded-md border">
            <SolutionEditor
              languageName={setup.languageName}
              value={referenceSolutionCode}
              onChange={setReferenceSolutionCode}
              editable={!isPending}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save reference solution"}
        </Button>
      </div>
    </div>
  );
}
