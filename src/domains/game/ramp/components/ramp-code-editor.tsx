"use client";

import SolutionEditor from "@/domains/workspace/solution-editor/components/solution-editor";
import type { ProgrammingLanguage } from "@/domains/language/models/programming-language";
import {
  useWorkspaceStore,
  selectWorkspaceCode,
  selectSelectedVersionId,
} from "@/domains/workspace/state/workspace-store";
import { findLanguageByVersionId } from "@/domains/language/lib/find-language-by-version-id";
import { useSubmissionStatus } from "@/domains/submission/api/get-submission-status";
import { useViewingSubmissionId } from "../../hooks/use-viewing-submission-id";

export default function RampCodeEditor({
  gameId,
  viewingProblemId,
  isViewingHistory,
  availableLanguages,
}: Readonly<{
  gameId: string;
  viewingProblemId: string | null;
  isViewingHistory: boolean;
  availableLanguages: ProgrammingLanguage[] | undefined;
}>) {
  const workspaceCode = useWorkspaceStore(selectWorkspaceCode);
  const setCode = useWorkspaceStore((s) => s.setCode);
  const selectedVersionId = useWorkspaceStore(selectSelectedVersionId);
  const languageName = findLanguageByVersionId(
    availableLanguages ?? [],
    selectedVersionId
  )?.name;
  const viewingSubmissionId = useViewingSubmissionId(gameId, viewingProblemId);
  const { data: historicalSubmission } =
    useSubmissionStatus(viewingSubmissionId);

  if (isViewingHistory) {
    return (
      <SolutionEditor
        value={historicalSubmission?.code ?? ""}
        editable={false}
        languageName={languageName}
      />
    );
  }

  return (
    <SolutionEditor
      value={workspaceCode}
      onChange={setCode}
      languageName={languageName}
    />
  );
}
