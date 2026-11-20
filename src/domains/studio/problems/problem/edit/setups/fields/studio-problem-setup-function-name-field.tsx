"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useStudioProblemSetupsStore } from "../studio-problem-setups-store-context";
import { selectSetupField } from "../studio-problem-setups-store";

type StudioProblemSetupFunctionNameFieldProps = {
  languageVersionId: string;
  fallbackValue: string;
  isDisabled: boolean;
};

export default function StudioProblemSetupFunctionNameField({
  languageVersionId,
  fallbackValue,
  isDisabled,
}: Readonly<StudioProblemSetupFunctionNameFieldProps>) {
  const functionName = useStudioProblemSetupsStore(
    selectSetupField(languageVersionId, "functionName")
  );
  const changeFunctionName = useStudioProblemSetupsStore(
    (state) => state.changeFunctionName
  );

  const fieldId = `studio-setup-function-name-${languageVersionId}`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>Function name</Label>
      <Input
        id={fieldId}
        value={functionName ?? fallbackValue}
        onChange={(e) => changeFunctionName(languageVersionId, e.target.value)}
        disabled={isDisabled}
      />
      <p className="text-sm text-muted-foreground">
        Entry point the judge calls.
      </p>
    </div>
  );
}
