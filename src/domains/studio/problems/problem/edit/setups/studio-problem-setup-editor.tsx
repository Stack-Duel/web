"use client";

import { toast } from "sonner";
import { useUpsertStudioProblemSetupSolution } from "@/domains/studio/api/upsert-studio-problem-setup-solution";
import type { StudioProblemSetup } from "@/domains/studio/models/studio-problem-setup";
import { useStudioProblemSetupsStoreApi } from "./studio-problem-setups-store-context";
import { toSetupDraft } from "./studio-problem-setups-store";
import StudioProblemSetupFunctionNameField from "./fields/studio-problem-setup-function-name-field";
import StudioProblemSetupCodeField from "./fields/studio-problem-setup-code-field";
import StudioProblemSetupActions from "./fields/studio-problem-setup-actions";

type StudioProblemSetupEditorProps = {
  problemId: string;
  setup: StudioProblemSetup;
};

export default function StudioProblemSetupEditor({
  problemId,
  setup,
}: Readonly<StudioProblemSetupEditorProps>) {
  const { languageVersionId } = setup;

  const store = useStudioProblemSetupsStoreApi();

  const { mutate: save, isPending } = useUpsertStudioProblemSetupSolution();

  const handleSave = () => {
    const draft =
      store.getState().drafts[languageVersionId] ?? toSetupDraft(setup);

    if (!draft.referenceSolution.trim()) {
      toast.error("A reference solution is required.");
      return;
    }

    save(
      {
        problemId,
        languageVersionId,
        starterCode: draft.starterCode,
        functionName: draft.functionName.trim() || null,
        referenceSolution: draft.referenceSolution,
      },
      {
        onSuccess: () => {
          store.getState().markSetupSaved(languageVersionId);
          toast.success(`Saved ${setup.language} setup`);
        },
        onError: (error) =>
          toast.error(error.message || "Failed to save language setup"),
      }
    );
  };

  const fallbackDraft = toSetupDraft(setup);

  return (
    <div className="space-y-3">
      <StudioProblemSetupFunctionNameField
        languageVersionId={languageVersionId}
        fallbackValue={fallbackDraft.functionName}
        isDisabled={isPending}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <StudioProblemSetupCodeField
          field="starterCode"
          languageVersionId={languageVersionId}
          language={setup.language}
          fallbackValue={fallbackDraft.starterCode}
          isDisabled={isPending}
        />
        <StudioProblemSetupCodeField
          field="referenceSolution"
          languageVersionId={languageVersionId}
          language={setup.language}
          fallbackValue={fallbackDraft.referenceSolution}
          isDisabled={isPending}
        />
      </div>

      <StudioProblemSetupActions
        languageVersionId={languageVersionId}
        isSaving={isPending}
        onSave={handleSave}
      />
    </div>
  );
}
