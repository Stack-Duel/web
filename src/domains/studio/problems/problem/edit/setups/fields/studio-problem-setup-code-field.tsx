"use client";

import { Label } from "@/shared/components/ui/label";
import SolutionEditor from "@/domains/workspace/solution-editor/components/solution-editor";
import { useStudioProblemSetupsStore } from "../studio-problem-setups-store-context";
import { selectSetupField } from "../studio-problem-setups-store";

type CodeField = "starterCode" | "referenceSolution";

const FIELD_LABELS: Record<CodeField, string> = {
  starterCode: "Starter code",
  referenceSolution: "Reference solution",
};

type StudioProblemSetupCodeFieldProps = {
  field: CodeField;
  languageVersionId: string;
  language: string;
  fallbackValue: string;
  isDisabled: boolean;
};

export default function StudioProblemSetupCodeField({
  field,
  languageVersionId,
  language,
  fallbackValue,
  isDisabled,
}: Readonly<StudioProblemSetupCodeFieldProps>) {
  const value = useStudioProblemSetupsStore(
    selectSetupField(languageVersionId, field)
  );
  const changeValue = useStudioProblemSetupsStore((state) =>
    field === "starterCode"
      ? state.changeStarterCode
      : state.changeReferenceSolution
  );

  const label = FIELD_LABELS[field];

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="h-64 overflow-hidden rounded-md border">
        <SolutionEditor
          aria-label={`${language} ${label.toLowerCase()}`}
          languageName={language}
          value={value ?? fallbackValue}
          onChange={(nextValue) => changeValue(languageVersionId, nextValue)}
          editable={!isDisabled}
        />
      </div>
    </div>
  );
}
