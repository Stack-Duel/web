"use client";

import { EditorWindow } from "./editor";
import type { EditorWindowTabNode } from "./state/editor-window-store";
import {
  useWorkspaceStore,
  selectActiveTabByNode,
} from "@/domains/workspace/state/workspace-store";

type WorkspaceEditorWindowProps = {
  readonly tabs: EditorWindowTabNode;
};

export function WorkspaceEditorWindow({ tabs }: WorkspaceEditorWindowProps) {
  const activeTabByNode = useWorkspaceStore(selectActiveTabByNode);
  const setActiveTab = useWorkspaceStore((s) => s.setActiveTab);

  return (
    <EditorWindow
      tabs={tabs}
      activeTabByNode={activeTabByNode}
      onTabActivate={setActiveTab}
    />
  );
}
