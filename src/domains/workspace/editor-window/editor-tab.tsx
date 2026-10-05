"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import { Card } from "@/shared/components/ui/card";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shared/components/ui/resizable";
import { EditorWindowPanelHeader } from "./editor-panel-header";
import {
  BoundaryAwareHandle,
  EditorWindowOuterZones,
  EditorWindowSplitZones,
} from "./editor-split-zones";
import {
  buildShape,
  collectLeafKeys,
  findGroupContainingKey,
  flattenContent,
  getTabsGroupById,
  insertAtOuterEdge,
  insertSiblingAtIndex,
  keySignature,
  moveTabInShape,
  reconcileShape,
  splitShapeWithTab,
  updateSplitSizes,
  type Edge,
  type EditorWindowTabNode,
  type ShapeNode,
} from "./state/editor-window-store";

export const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  const groupOrTabHit = pointerCollisions.find((collision) => {
    const id = String(collision.id);
    return id.startsWith("group:") || id.startsWith("tab:");
  });
  if (groupOrTabHit) return [groupOrTabHit];

  // The outer rim overlaps the pane edge zones. It should win there, but not
  // when the pointer is actually over a tab or pane header.
  const outerHit = pointerCollisions.find((collision) =>
    String(collision.id).startsWith("outer:")
  );
  if (outerHit) return [outerHit];
  // A divider between two already-split panes overlaps both neighbors' own
  // edge zones. Dropping "on the boundary" should always win over "on
  // whichever pane's edge I happen to be closest to".
  const boundaryHit = pointerCollisions.find((collision) =>
    String(collision.id).startsWith("boundary:")
  );
  if (boundaryHit) return [boundaryHit];
  return pointerCollisions.length > 0
    ? pointerCollisions
    : rectIntersection(args);
};

type EditorWindowTabProps = {
  tab?: EditorWindowTabNode;
  /** Which child tab is active per node ID. Store-agnostic: callers own
   *  where this lives (redux, zustand, etc.) and pass it down. */
  activeTabByNode: Record<string, number>;
  /** Called with the node ID and the newly-clicked (or moved-to) tab index. */
  onTabActivate: (nodeId: string, tabIndex: number) => void;
  /** A one-shot request to bring the tab with this key to the front of
   *  whichever pane it currently lives in. The arrangement (`shape`) is
   *  private to this component, so external UI (e.g. a file explorer) can't
   *  address a pane directly and needs this instead. `requestId` always
   *  changes so re-requesting the same already-focused key still fires. */
  focusRequest?: { key: string; requestId: number } | null;
};

type LayoutNodeViewProps = {
  shapeNode: ShapeNode;
  contentByKey: Record<string, EditorWindowTabNode>;
  activeTabByNode: Record<string, number>;
  onTabActivate: (nodeId: string, tabIndex: number) => void;
  onSplitLayoutChange: (
    splitId: string,
    layout: Record<string, number>
  ) => void;
};

const LayoutNodeView = ({
  shapeNode,
  contentByKey,
  activeTabByNode,
  onTabActivate,
  onSplitLayoutChange,
}: LayoutNodeViewProps) => {
  if (shapeNode.kind === "split") {
    return (
      <ResizablePanelGroup
        orientation={shapeNode.orientation}
        className="min-h-0 min-w-0 overflow-hidden"
        onLayoutChanged={(layout) => onSplitLayoutChange(shapeNode.id, layout)}
      >
        {shapeNode.children.map((child, index) => (
          <Fragment key={child.id}>
            <ResizablePanel
              id={child.id}
              defaultSize={
                child.defaultSize !== undefined
                  ? `${child.defaultSize}%`
                  : undefined
              }
              minSize="10%"
            >
              <LayoutNodeView
                shapeNode={child}
                contentByKey={contentByKey}
                activeTabByNode={activeTabByNode}
                onTabActivate={onTabActivate}
                onSplitLayoutChange={onSplitLayoutChange}
              />
            </ResizablePanel>
            {index !== shapeNode.children.length - 1 ? (
              <BoundaryAwareHandle splitId={shapeNode.id} index={index + 1} />
            ) : null}
          </Fragment>
        ))}
      </ResizablePanelGroup>
    );
  }

  const tabs = shapeNode.tabKeys
    .map((key) => contentByKey[key])
    .filter((t): t is EditorWindowTabNode => Boolean(t));
  const activeIndex = Math.min(
    activeTabByNode[shapeNode.id] ?? 0,
    Math.max(tabs.length - 1, 0)
  );
  const currentTab = tabs[activeIndex];
  const headerTab: EditorWindowTabNode =
    tabs.length === 1
      ? { ...tabs[0], key: shapeNode.tabKeys[0] }
      : {
          children: tabs.map((tab, index) => ({
            ...tab,
            key: shapeNode.tabKeys[index],
          })),
        };

  return (
    <Card className="h-full min-h-0 min-w-0 overflow-hidden bg-sidebar py-0 gap-0 flex flex-col">
      <EditorWindowPanelHeader
        tab={headerTab}
        currentTabIndex={activeIndex}
        setCurrentTab={(index) => onTabActivate(shapeNode.id, index)}
        groupId={shapeNode.id}
      />
      <div className="relative min-h-0 min-w-0 flex-1 overflow-y-auto">
        {currentTab?.component}
        <EditorWindowSplitZones groupId={shapeNode.id} />
      </div>
    </Card>
  );
};

export const EditorWindowTab = ({
  tab,
  activeTabByNode,
  onTabActivate,
  focusRequest,
}: EditorWindowTabProps) => {
  const contentByKey = useMemo(() => (tab ? flattenContent(tab) : {}), [tab]);
  const specSignature = useMemo(
    () => keySignature(Object.keys(contentByKey)),
    [contentByKey]
  );

  const [state, setState] = useState<{
    shape: ShapeNode | null;
    signature: string;
  }>(() => ({
    shape: tab ? buildShape(tab) : null,
    signature: specSignature,
  }));

  // The tab set changed shape (e.g. mobile/desktop layout swap). Rebuild the
  // layout from the new spec. Otherwise keep the user's drag rearrangement,
  // even though `tab` is a fresh object every render.
  if (state.signature !== specSignature) {
    const nextShape = tab ? buildShape(tab) : null;
    const existingKeys = state.shape ? collectLeafKeys(state.shape) : [];
    const canReconcile =
      state.shape && existingKeys.every((key) => contentByKey[key]);
    setState({
      shape:
        canReconcile && nextShape && state.shape
          ? reconcileShape(state.shape, nextShape)
          : nextShape,
      signature: specSignature,
    });
  }

  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const dndId = useId();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const shape = state.shape;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!shape) return;
      const activeId = String(event.active.id);
      const overId = event.over?.id;
      if (!overId || !activeId.startsWith("tab:")) return;

      const key = activeId.slice("tab:".length);
      const overStr = String(overId);

      if (overStr.startsWith("outer:")) {
        const edge = overStr.slice("outer:".length) as Edge;
        setState((prev) =>
          prev.shape
            ? { ...prev, shape: insertAtOuterEdge(prev.shape, key, edge) }
            : prev
        );
        return;
      }

      if (overStr.startsWith("edge:")) {
        const [, groupId, edge] = overStr.split(":");
        setState((prev) =>
          prev.shape
            ? {
                ...prev,
                shape: splitShapeWithTab(
                  prev.shape,
                  key,
                  groupId,
                  edge as Edge
                ),
              }
            : prev
        );
        return;
      }

      if (overStr.startsWith("boundary:")) {
        const [, splitId, indexStr] = overStr.split(":");
        const index = Number(indexStr);
        setState((prev) =>
          prev.shape
            ? {
                ...prev,
                shape: insertSiblingAtIndex(prev.shape, key, splitId, index),
              }
            : prev
        );
        return;
      }

      if (overStr.startsWith("tab:")) {
        const overKey = overStr.slice("tab:".length);
        if (overKey === key) return;
        const targetGroup = findGroupContainingKey(shape, overKey);
        if (!targetGroup) return;
        const targetIndex = targetGroup.tabKeys.indexOf(overKey);
        setState((prev) =>
          prev.shape
            ? {
                ...prev,
                shape: moveTabInShape(
                  prev.shape,
                  key,
                  targetGroup.id,
                  targetIndex
                ),
              }
            : prev
        );
        onTabActivate(targetGroup.id, targetIndex);
        return;
      }

      if (overStr.startsWith("group:")) {
        const groupId = overStr.slice("group:".length);
        const target = getTabsGroupById(shape, groupId);
        if (!target) return;
        const targetIndex = target.tabKeys.includes(key)
          ? target.tabKeys.indexOf(key)
          : target.tabKeys.length;
        setState((prev) =>
          prev.shape
            ? {
                ...prev,
                shape: moveTabInShape(prev.shape, key, groupId, targetIndex),
              }
            : prev
        );
        onTabActivate(groupId, targetIndex);
      }
    },
    [shape, onTabActivate]
  );

  const handleSplitLayoutChange = useCallback(
    (splitId: string, layout: Record<string, number>) => {
      setState((prev) =>
        prev.shape
          ? { ...prev, shape: updateSplitSizes(prev.shape, splitId, layout) }
          : prev
      );
    },
    []
  );

  useEffect(() => {
    if (!shape || !focusRequest) return;
    const group = findGroupContainingKey(shape, focusRequest.key);
    if (!group) return;
    const index = group.tabKeys.indexOf(focusRequest.key);
    if (index === -1) return;
    onTabActivate(group.id, index);
    // Only the requestId needs to gate re-firing (it always changes, even for
    // the same key). shape/onTabActivate changing on their own shouldn't
    // re-run this against a stale request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest?.requestId]);

  if (!shape) {
    return null;
  }

  const draggingTab = draggingKey ? contentByKey[draggingKey] : null;

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={(event) =>
        setDraggingKey(String(event.active.id).replace(/^tab:/, ""))
      }
      onDragEnd={(event) => {
        handleDragEnd(event);
        setDraggingKey(null);
      }}
      onDragCancel={() => setDraggingKey(null)}
    >
      <div className="relative h-full min-h-0 min-w-0 w-full overflow-hidden">
        <LayoutNodeView
          shapeNode={shape}
          contentByKey={contentByKey}
          activeTabByNode={activeTabByNode}
          onTabActivate={onTabActivate}
          onSplitLayoutChange={handleSplitLayoutChange}
        />
        <EditorWindowOuterZones />
      </div>
      <DragOverlay dropAnimation={null}>
        {draggingTab ? (
          <div className="flex items-center gap-1 rounded-md border bg-secondary px-3 py-1 text-sm text-secondary-foreground shadow-lg">
            {draggingTab.icon}
            {draggingTab.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
