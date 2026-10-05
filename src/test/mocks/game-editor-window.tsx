import type { EditorWindowTabNode } from "@/domains/workspace/editor-window/state/editor-window-store";

type MockEditorWindowProps = {
  tabs: EditorWindowTabNode;
};

function renderLeaves(node: EditorWindowTabNode) {
  if (node.children) {
    return node.children.map((child, index) => (
      <div key={child.key ?? index}>{renderLeaves(child)}</div>
    ));
  }

  return (
    <div>
      <span data-testid="tab-name">{node.name}</span>
      {node.component}
    </div>
  );
}

export function EditorWindow({ tabs }: MockEditorWindowProps) {
  return <div>{renderLeaves(tabs)}</div>;
}
