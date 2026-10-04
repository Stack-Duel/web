"use client";

import ProblemLoading from "@/app/problems/[slug]/loading";
import { Problem } from "@/domains/problem/models/problem";
import { useInitializeProblem } from "@/domains/problem/hooks/use-problem-actions";
import { useProblemSetupSync } from "@/domains/problem/hooks/use-problem-setup-sync";
import Workspace from "@/domains/workspace/components/workspace";
import { WorkspaceHeader } from "@/domains/workspace/components/workspace-header";
import type { EditorWindowTabNode } from "@/domains/workspace/editor-window/state/editor-window-store";
import {
  createDescriptionTab,
  createTestsTab,
  createSubmissionTab,
} from "@/domains/workspace/editor-window/tabs/shared-editor-tabs";
import ReactPreview from "@/domains/workspace/react-preview/components/react-preview";
import FileExplorer from "@/domains/workspace/file-explorer/components/file-explorer";
import { findLanguageByVersionId } from "@/domains/language/lib/find-language-by-version-id";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import {
  useWorkspaceStore,
  selectActiveSubmissionId,
  selectIsSubmittingSubmission,
  selectSelectedVersionId,
  selectWorkspaceCode,
  selectFunctionName,
  selectAdditionalFiles,
  selectActiveFileKey,
  selectOpenFileKeys,
  MAIN_FILE_KEY,
} from "@/domains/workspace/state/workspace-store";
import { CodeXml, Eye } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import ProblemSolutionEditor, {
  ProblemSolutionFileEditor,
} from "./problem-solution-editor";

function ProblemPreview({ problem }: Readonly<{ problem: Problem }>) {
  const code = useWorkspaceStore(selectWorkspaceCode);
  const functionName = useWorkspaceStore(selectFunctionName);
  const additionalFiles = useWorkspaceStore(selectAdditionalFiles);

  return (
    <ReactPreview
      code={code}
      functionName={functionName}
      testCases={problem.publicTestCases}
      additionalFiles={additionalFiles}
    />
  );
}

function ProblemFileExplorer({
  activeKey,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
}: Readonly<{
  activeKey: string;
  onSelectFile: (key: string) => void;
  onAddFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
}>) {
  const files = useWorkspaceStore(selectAdditionalFiles);

  return (
    <FileExplorer
      files={files}
      activeKey={activeKey}
      onSelectFile={onSelectFile}
      onAddFile={onAddFile}
      onDeleteFile={onDeleteFile}
      onRenameFile={onRenameFile}
    />
  );
}

type ProblemLayoutProps = {
  problem: Problem;
};

export default function ProblemLayout({
  problem,
}: Readonly<ProblemLayoutProps>) {
  const isMobile = useIsMobile();
  const initializeProblem = useInitializeProblem();
  const { setup } = useProblemSetupSync();
  const activeSubmissionId = useWorkspaceStore(selectActiveSubmissionId);
  const isSubmittingSubmission = useWorkspaceStore(
    selectIsSubmittingSubmission
  );
  const selectedVersionId = useWorkspaceStore(selectSelectedVersionId);
  const openFileKeys = useWorkspaceStore(useShallow(selectOpenFileKeys));
  const activeFileKey = useWorkspaceStore(selectActiveFileKey);
  const requestFocusFile = useWorkspaceStore((s) => s.requestFocusFile);
  const addFile = useWorkspaceStore((s) => s.addFile);
  const closeFile = useWorkspaceStore((s) => s.closeFile);
  const deleteFile = useWorkspaceStore((s) => s.deleteFile);
  const renameFile = useWorkspaceStore((s) => s.renameFile);
  const languageName = findLanguageByVersionId(
    problem.availableLanguages ?? [],
    selectedVersionId
  )?.name;
  const isReactLanguage = languageName === "React";

  useEffect(() => {
    initializeProblem(problem);
  }, [initializeProblem, problem]);

  const tabs = useMemo((): EditorWindowTabNode => {
    const descriptionTab = createDescriptionTab({ problem });
    const problemTabs: EditorWindowTabNode = {
      key: "problem",
      name: "Problem",
      children: [descriptionTab],
    };

    const mobileProblemTab: EditorWindowTabNode = {
      ...descriptionTab,
      key: "problem",
      name: "Problem",
    };

    const previewTab: EditorWindowTabNode = {
      key: "preview",
      name: "Preview",
      icon: <Eye size={16} className="text-purple-600 dark:text-purple-400" />,
      component: <ProblemPreview problem={problem} />,
    };

    const testsTab = createTestsTab(problem?.publicTestCases);
    const submissionTab = createSubmissionTab({
      submissionId: activeSubmissionId,
      isSubmitting: isSubmittingSubmission,
    });

    const executionTabs: EditorWindowTabNode = {
      key: "execution",
      name: "Execution",
      children: [
        testsTab,
        submissionTab,
        ...(isReactLanguage ? [previewTab] : []),
      ],
    };

    // Desktop + React only: each open file is its own draggable tab (so files
    // can be split into separate panes), instead of the single "Code" tab
    // every other language/mobile still uses.
    const mainFileTab: EditorWindowTabNode = {
      key: MAIN_FILE_KEY,
      name: "Solution.jsx",
      component: (
        <ProblemSolutionFileEditor problem={problem} fileKey={MAIN_FILE_KEY} />
      ),
    };

    const additionalFileTabs: EditorWindowTabNode[] = openFileKeys.map(
      (filePath) => ({
        key: filePath,
        name: filePath,
        onClose: () => closeFile(filePath),
        component: (
          <ProblemSolutionFileEditor problem={problem} fileKey={filePath} />
        ),
      })
    );

    const desktopCodeTab: EditorWindowTabNode = isReactLanguage
      ? {
          key: "code",
          name: "Code",
          defaultSize: 50,
          icon: (
            <CodeXml size={16} className="text-green-600 dark:text-green-400" />
          ),
          children: [mainFileTab, ...additionalFileTabs],
        }
      : {
          key: "code",
          name: "Code",
          defaultSize: 50,
          icon: (
            <CodeXml size={16} className="text-green-600 dark:text-green-400" />
          ),
          component: <ProblemSolutionEditor problem={problem} />,
        };

    if (isMobile) {
      return {
        children: [
          {
            key: "code",
            name: "Code",
            icon: (
              <CodeXml
                size={16}
                className="text-green-600 dark:text-green-400"
              />
            ),
            component: <ProblemSolutionEditor problem={problem} />,
          },
          mobileProblemTab,
          testsTab,
          submissionTab,
          ...(isReactLanguage ? [previewTab] : []),
        ],
      };
    }

    return {
      orientation: "horizontal",
      children: [
        desktopCodeTab,
        {
          key: "right-column",
          defaultSize: 50,
          orientation: "vertical",
          children: [
            {
              ...problemTabs,
              defaultSize: 55,
            },
            {
              ...executionTabs,
              defaultSize: 45,
            },
          ],
        },
      ],
    };
  }, [
    isMobile,
    problem,
    activeSubmissionId,
    isSubmittingSubmission,
    isReactLanguage,
    openFileKeys,
    closeFile,
  ]);

  if (isMobile === undefined) return <ProblemLoading />;

  return (
    <SidebarLayout
      breadcrumbs={[]}
      headerItems={
        <WorkspaceHeader problem={problem} problemSetupId={setup?.id ?? null} />
      }
    >
      <div className="flex h-full min-h-0 min-w-0 gap-2 overflow-hidden px-2 pb-2 md:px-4 md:pb-4">
        {isReactLanguage && !isMobile && (
          <ProblemFileExplorer
            activeKey={activeFileKey}
            onSelectFile={requestFocusFile}
            onAddFile={addFile}
            onDeleteFile={deleteFile}
            onRenameFile={renameFile}
          />
        )}
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <Workspace tab={tabs} />
        </div>
      </div>
    </SidebarLayout>
  );
}
