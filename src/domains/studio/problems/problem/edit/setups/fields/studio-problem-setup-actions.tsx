"use client";

import { Button } from "@/shared/components/ui/button";
import { useStudioProblemSetupsStore } from "../studio-problem-setups-store-context";
import { selectSetupIsDirty } from "../studio-problem-setups-store";

type StudioProblemSetupActionsProps = {
  languageVersionId: string;
  isSaving: boolean;
  onSave: () => void;
};

export default function StudioProblemSetupActions({
  languageVersionId,
  isSaving,
  onSave,
}: Readonly<StudioProblemSetupActionsProps>) {
  const isDirty = useStudioProblemSetupsStore(
    selectSetupIsDirty(languageVersionId)
  );
  const revertSetup = useStudioProblemSetupsStore((state) => state.revertSetup);

  return (
    <div className="flex items-center justify-end gap-2">
      {isDirty && !isSaving && (
        <span className="mr-auto text-sm text-muted-foreground">
          Unsaved changes
        </span>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={() => revertSetup(languageVersionId)}
        disabled={isSaving || !isDirty}
      >
        Discard changes
      </Button>
      <Button onClick={onSave} disabled={isSaving || !isDirty}>
        {isSaving ? "Saving..." : "Save language setup"}
      </Button>
    </div>
  );
}
