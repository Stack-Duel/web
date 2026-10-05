"use client";

import { EditorWindowTab } from "./editor-tab";
import { EditorWindowTabNode } from "./state/editor-window-store";

export type EditorWindowProps = {
  tabs: EditorWindowTabNode;
  /** Which child tab is active per node ID. Store-agnostic: callers own
   *  where this lives (redux, zustand, etc.) and pass it down. */
  activeTabByNode: Record<string, number>;
  /** Called with the node ID and the newly-clicked tab index. */
  onTabActivate: (nodeId: string, tabIndex: number) => void;
};

export const EditorWindow = ({
  tabs,
  activeTabByNode,
  onTabActivate,
}: EditorWindowProps) => {
  return (
    <EditorWindowTab
      tab={tabs}
      activeTabByNode={activeTabByNode}
      onTabActivate={onTabActivate}
    />
  );
};
