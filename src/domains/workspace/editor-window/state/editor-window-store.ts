import { ReactNode } from "react";

export type EditorWindowTabNode = {
  component?: ReactNode;
  headerComponent?: ReactNode;
  icon?: ReactNode;
  key?: string;
  children?: EditorWindowTabNode[];
  name?: string;
  orientation?: "horizontal" | "vertical";
  defaultSize?: number;
  onClose?: () => void;
};

export type Edge = "top" | "bottom" | "left" | "right";

export type SplitShapeNode = {
  kind: "split";
  id: string;
  orientation: "horizontal" | "vertical";
  children: ShapeNode[];
  defaultSize?: number;
};

export type TabsShapeNode = {
  kind: "tabs";
  id: string;
  tabKeys: string[];
  defaultSize?: number;
};

export type ShapeNode = SplitShapeNode | TabsShapeNode;

let syntheticIdCounter = 0;

function nextSyntheticId(prefix: string): string {
  syntheticIdCounter += 1;
  return `${prefix}-${syntheticIdCounter}`;
}

/** Structural tree (splits + tab groups, ordered by key) built from a caller's
 *  spec. Owned as component-local state so drag-and-drop rearrangement
 *  survives re-renders even though the spec is rebuilt fresh every time. */
export function buildShape(node: EditorWindowTabNode, id = "root"): ShapeNode {
  if (node.orientation) {
    return {
      kind: "split",
      id: node.key ?? id,
      orientation: node.orientation,
      defaultSize: node.defaultSize,
      children: (node.children ?? []).map((child, index) =>
        buildShape(child, `${id}.${index}`)
      ),
    };
  }

  if (node.children) {
    return {
      kind: "tabs",
      id: node.key ?? id,
      defaultSize: node.defaultSize,
      tabKeys: node.children.map(
        (child, index) => child.key ?? `${id}.${index}`
      ),
    };
  }

  return {
    kind: "tabs",
    id: node.key ?? id,
    defaultSize: node.defaultSize,
    tabKeys: [node.key ?? id],
  };
}

/** Flattens a spec tree into content by key, mirroring the key assignment in
 *  buildShape so every tabKeys entry resolves to its content here. */
export function flattenContent(
  node: EditorWindowTabNode,
  id = "root",
  out: Record<string, EditorWindowTabNode> = {}
): Record<string, EditorWindowTabNode> {
  if (node.orientation) {
    node.children?.forEach((child, index) =>
      flattenContent(child, `${id}.${index}`, out)
    );
    return out;
  }

  if (node.children) {
    node.children.forEach((child, index) => {
      out[child.key ?? `${id}.${index}`] = child;
    });
    return out;
  }

  out[node.key ?? id] = node;
  return out;
}

export function collectLeafKeys(shape: ShapeNode): string[] {
  if (shape.kind === "tabs") return shape.tabKeys;
  return shape.children.flatMap(collectLeafKeys);
}

function addKeyToGroup(
  shape: ShapeNode,
  groupId: string,
  key: string,
  anchorKey: string
): ShapeNode {
  if (shape.kind === "tabs") {
    if (shape.id !== groupId && !shape.tabKeys.includes(anchorKey))
      return shape;
    return shape.tabKeys.includes(key)
      ? shape
      : { ...shape, tabKeys: [...shape.tabKeys, key] };
  }

  return {
    ...shape,
    children: shape.children.map((child) =>
      addKeyToGroup(child, groupId, key, anchorKey)
    ),
  };
}

/** Reconciles added/removed tab keys without discarding a user's split layout. */
export function reconcileShape(
  shape: ShapeNode,
  nextSpec: ShapeNode
): ShapeNode {
  let next = shape;
  const desiredKeys = new Set(collectLeafKeys(nextSpec));

  for (const key of collectLeafKeys(next)) {
    if (!desiredKeys.has(key)) next = removeKeyFromShape(next, key);
  }

  function addMissingGroups(spec: ShapeNode): void {
    if (spec.kind === "tabs") {
      const existingKeys = new Set(collectLeafKeys(next));
      const anchorKey = spec.tabKeys[0];
      for (const key of spec.tabKeys) {
        if (!existingKeys.has(key)) {
          next = addKeyToGroup(next, spec.id, key, anchorKey);
          existingKeys.add(key);
        }
      }
      return;
    }

    spec.children.forEach(addMissingGroups);
  }

  addMissingGroups(nextSpec);

  return next;
}

export function keySignature(keys: string[]): string {
  return [...keys].sort((a, b) => a.localeCompare(b)).join("|");
}

export function findGroupContainingKey(
  shape: ShapeNode,
  key: string
): TabsShapeNode | null {
  if (shape.kind === "tabs") {
    return shape.tabKeys.includes(key) ? shape : null;
  }
  for (const child of shape.children) {
    const found = findGroupContainingKey(child, key);
    if (found) return found;
  }
  return null;
}

export function getTabsGroupById(
  shape: ShapeNode,
  groupId: string
): TabsShapeNode | null {
  if (shape.kind === "tabs") {
    return shape.id === groupId ? shape : null;
  }
  for (const child of shape.children) {
    const found = getTabsGroupById(child, groupId);
    if (found) return found;
  }
  return null;
}

function replaceTabsGroup(
  shape: ShapeNode,
  targetId: string,
  replacement: ShapeNode
): ShapeNode {
  if (shape.kind === "tabs") {
    return shape.id === targetId ? replacement : shape;
  }
  return {
    ...shape,
    children: shape.children.map((child) =>
      replaceTabsGroup(child, targetId, replacement)
    ),
  };
}

/** Removes a key from wherever it lives in the tree. A group left empty is
 *  pruned, and a split left with a single child collapses into that child, so
 *  dragging the last tab out of a panel reclaims its space like VS Code does. */
function removeKeyFromShape(
  shape: ShapeNode,
  key: string,
  preserveSplitId?: string
): ShapeNode {
  if (shape.kind === "tabs") {
    if (!shape.tabKeys.includes(key)) return shape;
    return { ...shape, tabKeys: shape.tabKeys.filter((k) => k !== key) };
  }

  const children = shape.children
    .map((child) => removeKeyFromShape(child, key, preserveSplitId))
    .filter((child) => child.kind === "split" || child.tabKeys.length > 0);

  if (children.length === 1 && shape.id !== preserveSplitId) {
    return children[0];
  }
  return { ...shape, children };
}

/** Moves `key` into `targetGroupId` at `targetIndex`: reordering within a
 *  group, or relocating across groups (pruning the source if left empty). */
export function moveTabInShape(
  shape: ShapeNode,
  key: string,
  targetGroupId: string,
  targetIndex: number
): ShapeNode {
  const sourceGroup = findGroupContainingKey(shape, key);
  if (!sourceGroup) return shape;

  if (sourceGroup.id === targetGroupId) {
    const keys = sourceGroup.tabKeys.filter((k) => k !== key);
    const clamped = Math.max(0, Math.min(targetIndex, keys.length));
    keys.splice(clamped, 0, key);
    return replaceTabsGroup(shape, targetGroupId, {
      ...sourceGroup,
      tabKeys: keys,
    });
  }

  const withoutKey = removeKeyFromShape(shape, key);
  const target = getTabsGroupById(withoutKey, targetGroupId);
  if (!target) return shape;

  const keys = [...target.tabKeys];
  const clamped = Math.max(0, Math.min(targetIndex, keys.length));
  keys.splice(clamped, 0, key);
  return replaceTabsGroup(withoutKey, targetGroupId, {
    ...target,
    tabKeys: keys,
  });
}

/** Splits `targetGroupId` on `edge`, wrapping it in a new split node that
 *  holds the target group and a brand-new single-tab group for `key`. */
export function splitShapeWithTab(
  shape: ShapeNode,
  key: string,
  targetGroupId: string,
  edge: Edge
): ShapeNode {
  const sourceGroup = findGroupContainingKey(shape, key);
  if (!sourceGroup) return shape;
  if (sourceGroup.id === targetGroupId && sourceGroup.tabKeys.length === 1) {
    return shape;
  }

  const withoutKey = removeKeyFromShape(shape, key);
  const target = getTabsGroupById(withoutKey, targetGroupId);
  if (!target) return shape;

  const newGroup: ShapeNode = {
    kind: "tabs",
    id: nextSyntheticId("group"),
    tabKeys: [key],
    defaultSize: 50,
  };
  const resizedTarget: ShapeNode = { ...target, defaultSize: 50 };
  const orientation: "horizontal" | "vertical" =
    edge === "left" || edge === "right" ? "horizontal" : "vertical";
  const children =
    edge === "left" || edge === "top"
      ? [newGroup, resizedTarget]
      : [resizedTarget, newGroup];
  const wrapper: ShapeNode = {
    kind: "split",
    id: nextSyntheticId("split"),
    orientation,
    defaultSize: target.defaultSize,
    children,
  };

  return replaceTabsGroup(withoutKey, targetGroupId, wrapper);
}

/** Inserts `key` as a brand-new sibling directly into an existing split, at
 *  `index` among its current children. Spans the split's full
 *  cross-axis, unlike `splitShapeWithTab` which only carves out half of
 *  whichever single pane you dropped on. This is what backs dropping on the
 *  divider *between* two already-split panes, rather than near either
 *  pane's own edge. */
function findSplitById(node: ShapeNode, id: string): SplitShapeNode | null {
  if (node.kind !== "split") return null;
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findSplitById(child, id);
    if (found) return found;
  }
  return null;
}

export function insertSiblingAtIndex(
  shape: ShapeNode,
  key: string,
  splitId: string,
  index: number
): ShapeNode {
  if (!findSplitById(shape, splitId)) return shape;

  // Keep the target split in place while removing the source. If the source
  // is its only tab, normal pruning would collapse the split before insertion.
  const withoutKey = removeKeyFromShape(shape, key, splitId);
  const newGroup: TabsShapeNode = {
    kind: "tabs",
    id: nextSyntheticId("group"),
    tabKeys: [key],
  };

  function recurse(node: ShapeNode): ShapeNode {
    if (node.kind !== "split") return node;

    if (node.id === splitId) {
      const clampedIndex = Math.max(0, Math.min(index, node.children.length));
      const evenSize = 100 / node.children.length;
      const newSize = 100 / (node.children.length + 1);
      const scale = (100 - newSize) / 100;
      const resized = node.children.map((child) => ({
        ...child,
        defaultSize: (child.defaultSize ?? evenSize) * scale,
      }));
      resized.splice(clampedIndex, 0, { ...newGroup, defaultSize: newSize });
      return { ...node, children: resized };
    }

    return { ...node, children: node.children.map(recurse) };
  }

  return recurse(withoutKey);
}

/** Inserts `key` as a full-span new section at the true outer boundary of
 *  the whole editor tree. VS Code's "drag to the far edge of the entire
 *  editor area" behavior, distinct from `splitShapeWithTab` (splits just
 *  the one pane you're hovering, wherever it is) and `insertSiblingAtIndex`
 *  (a specific already-known split). When the root already runs the needed
 *  orientation, this is just inserting at its start/end; otherwise the
 *  whole current tree gets wrapped in one new outer split. */
export function insertAtOuterEdge(
  shape: ShapeNode,
  key: string,
  edge: Edge
): ShapeNode {
  const orientation: SplitShapeNode["orientation"] =
    edge === "left" || edge === "right" ? "horizontal" : "vertical";
  const atStart = edge === "left" || edge === "top";

  if (shape.kind === "split" && shape.orientation === orientation) {
    return insertSiblingAtIndex(
      shape,
      key,
      shape.id,
      atStart ? 0 : shape.children.length
    );
  }

  const withoutKey = removeKeyFromShape(shape, key);
  const newGroup: TabsShapeNode = {
    kind: "tabs",
    id: nextSyntheticId("group"),
    tabKeys: [key],
  };
  const resizedOld: ShapeNode = { ...withoutKey, defaultSize: 50 };
  const resizedNew: ShapeNode = { ...newGroup, defaultSize: 50 };

  return {
    kind: "split",
    id: nextSyntheticId("split"),
    orientation,
    children: atStart ? [resizedNew, resizedOld] : [resizedOld, resizedNew],
  };
}

export function updateSplitSizes(
  shape: ShapeNode,
  splitId: string,
  layout: Record<string, number>
): ShapeNode {
  if (shape.kind === "tabs") return shape;
  if (shape.id !== splitId) {
    return {
      ...shape,
      children: shape.children.map((child) =>
        updateSplitSizes(child, splitId, layout)
      ),
    };
  }

  return {
    ...shape,
    children: shape.children.map((child) =>
      layout[child.id] === undefined
        ? child
        : { ...child, defaultSize: layout[child.id] }
    ),
  };
}
