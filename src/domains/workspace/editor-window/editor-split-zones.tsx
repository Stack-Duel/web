"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";
import { ResizableHandle } from "@/shared/components/ui/resizable";
import { cn } from "@/shared/lib/utils";
import type { Edge } from "./state/editor-window-store";

const EDGES: Edge[] = ["top", "right", "bottom", "left"];

const EDGE_POSITION_CLASS: Record<Edge, string> = {
  top: "top-0 inset-x-0 h-1/4",
  bottom: "bottom-0 inset-x-0 h-1/4",
  left: "inset-y-0 left-0 w-1/4",
  right: "inset-y-0 right-0 w-1/4",
};

const EDGE_ACTIVE_POSITION_CLASS: Record<Edge, string> = {
  top: "top-0 inset-x-0 h-1/2",
  bottom: "bottom-0 inset-x-0 h-1/2",
  left: "inset-y-0 left-0 w-1/2",
  right: "inset-y-0 right-0 w-1/2",
};

function SplitZone({ groupId, edge }: { groupId: string; edge: Edge }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `edge:${groupId}:${edge}`,
  });

  return (
    <>
      <div
        ref={setNodeRef}
        data-testid={`split-zone-${edge}`}
        className={cn(
          "pointer-events-auto absolute",
          EDGE_POSITION_CLASS[edge]
        )}
      />
      {isOver ? (
        <div
          className={cn(
            "pointer-events-none absolute border-2 border-primary/60 bg-primary/25",
            EDGE_ACTIVE_POSITION_CLASS[edge]
          )}
        />
      ) : null}
    </>
  );
}

/** Renders four edge drop-zones over a panel, shown only while a tab is being
 *  dragged, so dropping near an edge splits that panel: VS Code's "drag to
 *  the edge to create a new group" behavior. */
export function EditorWindowSplitZones({ groupId }: { groupId: string }) {
  const { active } = useDndContext();
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {EDGES.map((edge) => (
        <SplitZone key={edge} groupId={groupId} edge={edge} />
      ))}
    </div>
  );
}

const OUTER_POSITION_CLASS: Record<Edge, string> = {
  top: "top-0 inset-x-0 h-[10%]",
  bottom: "bottom-0 inset-x-0 h-[10%]",
  left: "inset-y-0 left-0 w-[10%]",
  right: "inset-y-0 right-0 w-[10%]",
};

function OuterZone({ edge }: Readonly<{ edge: Edge }>) {
  const { setNodeRef, isOver } = useDroppable({ id: `outer:${edge}` });

  return (
    <div
      ref={setNodeRef}
      data-testid={`outer-zone-${edge}`}
      className={cn(
        "pointer-events-auto absolute",
        OUTER_POSITION_CLASS[edge],
        isOver && "border-2 border-primary bg-primary/30"
      )}
    />
  );
}

/** Drop zones covering the true outer boundary of the *entire* editor tree.
 *  Rendered once, wrapping everything, not per-pane. Dropping in this
 *  thin rim creates a full-span new section across the whole editor area
 *  (VS Code's "drag to the far edge of the editor" behavior), distinct
 *  from `EditorWindowSplitZones`, which only splits whichever individual
 *  pane you're hovering over. Deliberately thinner than the per-pane edge
 *  zones so both remain reachable: drop right at the true edge for a
 *  full-span group, or a little further in for a local split. */
export function EditorWindowOuterZones() {
  const { active } = useDndContext();
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {EDGES.map((edge) => (
        <OuterZone key={edge} edge={edge} />
      ))}
    </div>
  );
}

/** The resize handle between two already-split panes, doubling as a drop
 *  target: dropping directly on it inserts a brand-new sibling section
 *  spanning the split's full cross-axis, instead of carving out half of
 *  whichever neighboring pane you happened to be closest to.
 *
 *  Uses `elementRef` (react-resizable-panels' own prop for this, not a
 *  plain `ref`) to hand the real handle DOM node to dnd-kit. Panels and
 *  handles must stay direct children of their parent Group, so this can't
 *  be wrapped in an extra element the way the edge zones are. */
export function BoundaryAwareHandle({
  splitId,
  index,
}: Readonly<{
  splitId: string;
  index: number;
}>) {
  const { setNodeRef, isOver } = useDroppable({
    id: `boundary:${splitId}:${index}`,
  });

  return (
    <ResizableHandle
      elementRef={setNodeRef}
      className={cn(
        "bg-inherit p-1 cursor-col-resize aria-[orientation=horizontal]:cursor-row-resize",
        isOver && "bg-primary/60"
      )}
    />
  );
}
