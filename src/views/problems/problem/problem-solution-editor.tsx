"use client";

import SolutionEditor from "@/domains/workspace/solution-editor/components/solution-editor";
import FileExplorer from "@/domains/workspace/file-explorer/components/file-explorer";
import {
  useWorkspaceStore,
  selectWorkspaceCode,
  selectSelectedVersionId,
  selectAdditionalFiles,
  selectActiveFileKey,
  MAIN_FILE_KEY,
} from "@/domains/workspace/state/workspace-store";
import { Problem } from "@/domains/problem/models/problem";
import { findLanguageByVersionId } from "@/domains/language/lib/find-language-by-version-id";

type ProblemSolutionEditorProps = {
  problem: Problem;
};

export default function ProblemSolutionEditor({
  problem,
}: Readonly<ProblemSolutionEditorProps>) {
  const code = useWorkspaceStore(selectWorkspaceCode);
  const setCode = useWorkspaceStore((s) => s.setCode);
  const additionalFiles = useWorkspaceStore(selectAdditionalFiles);
  const activeFileKey = useWorkspaceStore(selectActiveFileKey);
  const requestFocusFile = useWorkspaceStore((s) => s.requestFocusFile);
  const updateFileContent = useWorkspaceStore((s) => s.updateFileContent);
  const addFile = useWorkspaceStore((s) => s.addFile);
  const deleteFile = useWorkspaceStore((s) => s.deleteFile);
  const renameFile = useWorkspaceStore((s) => s.renameFile);
  const selectedVersionId = useWorkspaceStore(selectSelectedVersionId);

  const languageName = findLanguageByVersionId(
    problem.availableLanguages ?? [],
    selectedVersionId
  )?.name;

  const isMultiFileCapable = languageName === "React";

  const activeValue =
    activeFileKey === MAIN_FILE_KEY
      ? code
      : (additionalFiles.find((f) => f.path === activeFileKey)?.content ?? "");
  const onActiveChange =
    activeFileKey === MAIN_FILE_KEY
      ? setCode
      : (value: string) => updateFileContent(activeFileKey, value);

  if (!isMultiFileCapable) {
    return (
      <SolutionEditor
        value={code}
        onChange={setCode}
        languageName={languageName}
      />
    );
  }

  return (
    <div className="flex h-full">
      <FileExplorer
        files={additionalFiles}
        activeKey={activeFileKey}
        onSelectFile={requestFocusFile}
        onAddFile={addFile}
        onDeleteFile={deleteFile}
        onRenameFile={renameFile}
      />
      <div className="min-w-0 flex-1">
        <SolutionEditor
          key={activeFileKey}
          value={activeValue}
          onChange={onActiveChange}
          languageName={languageName}
        />
      </div>
    </div>
  );
}

export function ProblemSolutionFileEditor({
  problem,
  fileKey,
}: Readonly<{
  problem: Problem;
  fileKey: string;
}>) {
  const code = useWorkspaceStore(selectWorkspaceCode);
  const additionalFiles = useWorkspaceStore(selectAdditionalFiles);
  const setCode = useWorkspaceStore((s) => s.setCode);
  const updateFileContent = useWorkspaceStore((s) => s.updateFileContent);
  const selectedVersionId = useWorkspaceStore(selectSelectedVersionId);
  const languageName = findLanguageByVersionId(
    problem.availableLanguages ?? [],
    selectedVersionId
  )?.name;
  const value =
    fileKey === MAIN_FILE_KEY
      ? code
      : (additionalFiles.find((file) => file.path === fileKey)?.content ?? "");
  const onChange =
    fileKey === MAIN_FILE_KEY
      ? setCode
      : (content: string) => updateFileContent(fileKey, content);

  return (
    <SolutionEditor
      value={value}
      onChange={onChange}
      languageName={languageName}
    />
  );
}
