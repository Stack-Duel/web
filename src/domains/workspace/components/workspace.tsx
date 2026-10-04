"use client";

import { EditorWindowTab } from "../editor-window/editor-tab";
import { EditorWindowTabNode } from "../editor-window/state/editor-window-store";
import {
  useWorkspaceStore,
  selectActiveTabByNode,
  selectFocusFileRequest,
} from "../state/workspace-store";

type WorkspaceProps = {
  readonly tab: EditorWindowTabNode;
};

export default function Workspace({ tab }: WorkspaceProps) {
  const activeTabByNode = useWorkspaceStore(selectActiveTabByNode);
  const setActiveTab = useWorkspaceStore((s) => s.setActiveTab);
  const focusFileRequest = useWorkspaceStore(selectFocusFileRequest);

  return (
    <EditorWindowTab
      tab={tab}
      activeTabByNode={activeTabByNode}
      onTabActivate={setActiveTab}
      focusRequest={focusFileRequest}
    />
  );
}
