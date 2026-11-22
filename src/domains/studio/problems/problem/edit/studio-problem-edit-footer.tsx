"use client";

import { Button } from "@/shared/components/ui/button";
import { useStudioProblemEditStore } from "./studio-problem-edit-store-context";
import {
  selectFirstVisibleError,
  selectHasVisibleErrors,
  selectIsDirty,
  selectUnsavedFieldCount,
} from "./studio-problem-edit-store";

export default function StudioProblemEditFooter({
  isSaving,
}: Readonly<{ isSaving: boolean }>) {
  const isDirty = useStudioProblemEditStore(selectIsDirty);
  const unsavedCount = useStudioProblemEditStore(selectUnsavedFieldCount);
  const hasVisibleErrors = useStudioProblemEditStore(selectHasVisibleErrors);
  const firstError = useStudioProblemEditStore(selectFirstVisibleError);
  const revertToSaved = useStudioProblemEditStore(
    (state) => state.revertToSaved
  );

  const status = isDirty
    ? `${unsavedCount} unsaved change${unsavedCount === 1 ? "" : "s"}`
    : "No unsaved changes";

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <p className="mr-auto text-sm text-muted-foreground">
        {status}
        {firstError ? ` · ${firstError}` : ""}
      </p>
      <Button
        type="button"
        variant="secondary"
        onClick={revertToSaved}
        disabled={isSaving || !isDirty}
      >
        Discard
      </Button>
      <Button type="submit" disabled={isSaving || !isDirty || hasVisibleErrors}>
        {isSaving ? "Saving..." : "Save details"}
      </Button>
    </div>
  );
}
