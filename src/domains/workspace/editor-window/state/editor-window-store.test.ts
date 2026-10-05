import { describe, expect, it } from "vitest";
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
  type ShapeNode,
} from "./editor-window-store";

describe("buildShape", () => {
  it("builds a single tab-group id from a lone leaf with no key", () => {
    const shape = buildShape({ name: "Editor" });

    expect(shape).toEqual({
      kind: "tabs",
      id: "root",
      defaultSize: undefined,
      tabKeys: ["root"],
    });
  });

  it("builds a tab group from children, using each child's key", () => {
    const shape = buildShape({
      children: [
        { key: "a", name: "A" },
        { key: "b", name: "B" },
      ],
    });

    expect(shape).toEqual({
      kind: "tabs",
      id: "root",
      defaultSize: undefined,
      tabKeys: ["a", "b"],
    });
  });

  it("builds a split node recursively, keying panels by their own key", () => {
    const shape = buildShape({
      orientation: "horizontal",
      children: [
        { key: "left", name: "Left" },
        { key: "right", children: [{ key: "r1", name: "R1" }] },
      ],
    });

    expect(shape).toEqual({
      kind: "split",
      id: "root",
      orientation: "horizontal",
      defaultSize: undefined,
      children: [
        { kind: "tabs", id: "left", defaultSize: undefined, tabKeys: ["left"] },
        { kind: "tabs", id: "right", defaultSize: undefined, tabKeys: ["r1"] },
      ],
    });
  });
});

describe("flattenContent", () => {
  it("indexes every leaf tab by the same key buildShape assigns it", () => {
    const spec = {
      orientation: "horizontal" as const,
      children: [
        { key: "left", name: "Left" },
        { key: "right", children: [{ key: "r1", name: "R1" }] },
      ],
    };

    const content = flattenContent(spec);

    expect(Object.keys(content).sort()).toEqual(["left", "r1"]);
    expect(content.left.name).toBe("Left");
    expect(content.r1.name).toBe("R1");
  });
});

describe("collectLeafKeys / keySignature", () => {
  it("collects every tab key across a split tree", () => {
    const shape: ShapeNode = {
      kind: "split",
      id: "root",
      orientation: "horizontal",
      children: [
        { kind: "tabs", id: "left", tabKeys: ["a", "b"] },
        { kind: "tabs", id: "right", tabKeys: ["c"] },
      ],
    };

    expect(collectLeafKeys(shape).sort()).toEqual(["a", "b", "c"]);
    expect(keySignature(["b", "a"])).toBe(keySignature(["a", "b"]));
  });
});

describe("moveTabInShape", () => {
  const shape: ShapeNode = {
    kind: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      { kind: "tabs", id: "left", tabKeys: ["a", "b"] },
      { kind: "tabs", id: "right", tabKeys: ["c"] },
    ],
  };

  it("reorders within the same group", () => {
    const next = moveTabInShape(shape, "a", "left", 1);

    expect(getTabsGroupById(next, "left")?.tabKeys).toEqual(["b", "a"]);
  });

  it("moves a tab into a different group at the given index", () => {
    const next = moveTabInShape(shape, "a", "right", 0);

    expect(getTabsGroupById(next, "left")?.tabKeys).toEqual(["b"]);
    expect(getTabsGroupById(next, "right")?.tabKeys).toEqual(["a", "c"]);
  });

  it("moves keyless tabs using the generated shape keys", () => {
    const keyless = buildShape({
      orientation: "horizontal",
      children: [{ name: "Top" }, { name: "Bottom" }],
    });

    const next = moveTabInShape(keyless, "root.1", "root.0", 0);

    expect(collectLeafKeys(next)).toEqual(["root.1", "root.0"]);
  });

  it("prunes a group left empty and collapses its parent split", () => {
    const next = moveTabInShape(shape, "c", "left", 0);

    expect(next.kind).toBe("tabs");
    expect((next as { tabKeys: string[] }).tabKeys).toEqual(["c", "a", "b"]);
    expect(getTabsGroupById(next, "right")).toBeNull();
  });

  it("is a no-op when the key doesn't exist anywhere", () => {
    const next = moveTabInShape(shape, "missing", "left", 0);

    expect(next).toBe(shape);
  });

  it("is a no-op when the target group doesn't exist", () => {
    const next = moveTabInShape(shape, "a", "missing", 0);

    expect(next).toBe(shape);
  });
});

describe("reconcileShape", () => {
  it("adds a new tab to its existing group without resetting splits", () => {
    const current = buildShape({
      orientation: "horizontal",
      children: [
        { key: "code", children: [{ key: "main" }] },
        { key: "preview", children: [{ key: "preview-tab" }] },
      ],
    });
    const nextSpec = buildShape({
      orientation: "horizontal",
      children: [
        { key: "code", children: [{ key: "main" }, { key: "helper" }] },
        { key: "preview", children: [{ key: "preview-tab" }] },
      ],
    });

    const next = reconcileShape(current, nextSpec);

    expect(next).toEqual(
      expect.objectContaining({ kind: "split", id: "root" })
    );
    expect(getTabsGroupById(next, "code")?.tabKeys).toEqual(["main", "helper"]);
  });
});

describe("splitShapeWithTab", () => {
  const shape: ShapeNode = {
    kind: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      { kind: "tabs", id: "left", tabKeys: ["a", "b"] },
      { kind: "tabs", id: "right", tabKeys: ["c"] },
    ],
  };

  it("wraps the target group in a new vertical split on top", () => {
    const next = splitShapeWithTab(shape, "a", "right", "top");

    expect(next.kind).toBe("split");
    const rightSubtree = (next as { children: ShapeNode[] }).children.find(
      (c) => "children" in c || getTabsGroupById(c, "right")
    )!;
    expect(rightSubtree.kind).toBe("split");
    if (rightSubtree.kind === "split") {
      expect(rightSubtree.orientation).toBe("vertical");
      expect(rightSubtree.children[0].kind).toBe("tabs");
      expect(
        (rightSubtree.children[0] as { tabKeys: string[] }).tabKeys
      ).toEqual(["a"]);
      expect(getTabsGroupById(rightSubtree, "right")?.tabKeys).toEqual(["c"]);
    }

    expect(getTabsGroupById(next, "left")?.tabKeys).toEqual(["b"]);
  });

  it("wraps the target group in a new horizontal split on the right", () => {
    const next = splitShapeWithTab(shape, "a", "right", "right");

    const rightSubtree = getTabsGroupById(next, "right");
    expect(rightSubtree).not.toBeNull();

    function findParentOf(node: ShapeNode, id: string): SplitOrNull {
      if (node.kind === "tabs") return null;
      if (node.children.some((c) => c.kind === "tabs" && c.id === id))
        return node;
      for (const child of node.children) {
        const found = findParentOf(child, id);
        if (found) return found;
      }
      return null;
    }
    type SplitOrNull = Extract<ShapeNode, { kind: "split" }> | null;

    const parent = findParentOf(next, "right");
    expect(parent?.orientation).toBe("horizontal");
    expect(parent?.children[0]).toEqual(
      expect.objectContaining({ id: "right" })
    );
    expect(parent?.children[1]).toEqual(
      expect.objectContaining({ tabKeys: ["a"] })
    );
  });

  it("refuses to split a group's only tab against itself", () => {
    const solo: ShapeNode = { kind: "tabs", id: "only", tabKeys: ["x"] };

    const next = splitShapeWithTab(solo, "x", "only", "left");

    expect(next).toBe(solo);
  });
});

describe("insertSiblingAtIndex", () => {
  const shape: ShapeNode = {
    kind: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      { kind: "tabs", id: "left", tabKeys: ["a"], defaultSize: 60 },
      { kind: "tabs", id: "right", tabKeys: ["b"], defaultSize: 40 },
    ],
  };

  it("inserts a new full-span sibling at the given index, resizing the others proportionally", () => {
    const next = insertSiblingAtIndex(shape, "c", "root", 1);

    expect(next.kind).toBe("split");
    if (next.kind !== "split") return;
    expect(next.children).toHaveLength(3);
    expect(next.children[0]).toEqual(expect.objectContaining({ id: "left" }));
    expect(next.children[2]).toEqual(expect.objectContaining({ id: "right" }));
    expect((next.children[1] as { tabKeys: string[] }).tabKeys).toEqual(["c"]);

    // The new pane gets a fair equal share; the two existing panes are
    // scaled down to make room while preserving their relative 60:40 ratio
    // to each other, rather than being force-equalized.
    const [left, inserted, right] = next.children.map(
      (c) => c.defaultSize ?? 0
    );
    expect(inserted).toBeCloseTo(100 / 3, 5);
    expect(left + inserted + right).toBeCloseTo(100, 5);
    expect(left / right).toBeCloseTo(60 / 40, 5);
  });

  it("keeps the target split when moving its only bottom tab onto the divider", () => {
    const next = insertSiblingAtIndex(shape, "b", "root", 1);

    expect(next.kind).toBe("split");
    if (next.kind !== "split") return;
    expect(next.children).toHaveLength(2);
    expect(next.children[1]).toEqual(
      expect.objectContaining({ tabKeys: ["b"] })
    );
  });

  it("removes the key from wherever it lived before inserting it as a new sibling", () => {
    const withBothInLeft: ShapeNode = {
      kind: "split",
      id: "root",
      orientation: "horizontal",
      children: [
        { kind: "tabs", id: "left", tabKeys: ["a", "c"] },
        { kind: "tabs", id: "right", tabKeys: ["b"] },
      ],
    };

    const next = insertSiblingAtIndex(withBothInLeft, "c", "root", 2);

    expect(getTabsGroupById(next, "left")?.tabKeys).toEqual(["a"]);
    expect(next.kind === "split" && next.children).toHaveLength(3);
  });

  it("clamps an out-of-range index to a valid position", () => {
    const next = insertSiblingAtIndex(shape, "c", "root", 99);

    expect(next.kind === "split" && next.children[2]).toEqual(
      expect.objectContaining({ tabKeys: ["c"] })
    );
  });

  it("is a no-op when the target split doesn't exist", () => {
    const next = insertSiblingAtIndex(shape, "c", "missing", 0);

    expect(next).toBe(shape);
  });

  it("inserts into the correct split when nested inside another", () => {
    const nested: ShapeNode = {
      kind: "split",
      id: "root",
      orientation: "horizontal",
      children: [
        { kind: "tabs", id: "left", tabKeys: ["a"] },
        {
          kind: "split",
          id: "right-column",
          orientation: "vertical",
          children: [
            { kind: "tabs", id: "top", tabKeys: ["b"] },
            { kind: "tabs", id: "bottom", tabKeys: ["c"] },
          ],
        },
      ],
    };

    const next = insertSiblingAtIndex(nested, "d", "right-column", 1);

    const rightColumn = next.kind === "split" ? next.children[1] : null;
    expect(rightColumn?.kind).toBe("split");
    if (rightColumn?.kind === "split") {
      expect(rightColumn.children).toHaveLength(3);
      expect(
        (rightColumn.children[1] as { tabKeys: string[] }).tabKeys
      ).toEqual(["d"]);
    }
  });
});

describe("findGroupContainingKey", () => {
  it("finds the tabs group holding a key", () => {
    const shape: ShapeNode = {
      kind: "split",
      id: "root",
      orientation: "horizontal",
      children: [
        { kind: "tabs", id: "left", tabKeys: ["a"] },
        { kind: "tabs", id: "right", tabKeys: ["b"] },
      ],
    };

    expect(findGroupContainingKey(shape, "b")?.id).toBe("right");
    expect(findGroupContainingKey(shape, "missing")).toBeNull();
  });
});

describe("insertAtOuterEdge", () => {
  const horizontalSplit: ShapeNode = {
    kind: "split",
    id: "root",
    orientation: "horizontal",
    children: [{ kind: "tabs", id: "left", tabKeys: ["a"], defaultSize: 100 }],
  };

  it("inserts at the start when the root already splits horizontally (edge: left)", () => {
    const next = insertAtOuterEdge(horizontalSplit, "b", "left");

    expect(next.kind).toBe("split");
    if (next.kind !== "split") return;
    expect(next.children[0]).toEqual(
      expect.objectContaining({ tabKeys: ["b"] })
    );
  });

  it("inserts at the end when the root already splits horizontally (edge: right)", () => {
    const next = insertAtOuterEdge(horizontalSplit, "b", "right");

    expect(next.kind).toBe("split");
    if (next.kind !== "split") return;
    expect(next.children[next.children.length - 1]).toEqual(
      expect.objectContaining({ tabKeys: ["b"] })
    );
  });

  it("wraps a lone tab group in a new vertical split, new pane first (edge: top)", () => {
    const shape: ShapeNode = { kind: "tabs", id: "root", tabKeys: ["a"] };

    const next = insertAtOuterEdge(shape, "b", "top");

    expect(next.kind).toBe("split");
    if (next.kind !== "split") return;
    expect(next.orientation).toBe("vertical");
    expect(next.children[0]).toEqual(
      expect.objectContaining({ tabKeys: ["b"] })
    );
    expect(next.children[1]).toEqual(
      expect.objectContaining({ tabKeys: ["a"] })
    );
  });

  it("wraps a lone tab group in a new vertical split, new pane last (edge: bottom)", () => {
    const shape: ShapeNode = { kind: "tabs", id: "root", tabKeys: ["a"] };

    const next = insertAtOuterEdge(shape, "b", "bottom");

    expect(next.kind).toBe("split");
    if (next.kind !== "split") return;
    expect(next.orientation).toBe("vertical");
    expect(next.children[0]).toEqual(
      expect.objectContaining({ tabKeys: ["a"] })
    );
    expect(next.children[1]).toEqual(
      expect.objectContaining({ tabKeys: ["b"] })
    );
  });
});

describe("updateSplitSizes", () => {
  it("returns a tabs group unchanged", () => {
    const shape: ShapeNode = { kind: "tabs", id: "leaf", tabKeys: ["a"] };

    expect(updateSplitSizes(shape, "root", { leaf: 70 })).toBe(shape);
  });

  it("updates matching children's defaultSize and leaves others untouched", () => {
    const shape: ShapeNode = {
      kind: "split",
      id: "root",
      orientation: "horizontal",
      children: [
        { kind: "tabs", id: "left", tabKeys: ["a"], defaultSize: 50 },
        { kind: "tabs", id: "right", tabKeys: ["b"], defaultSize: 50 },
      ],
    };

    const next = updateSplitSizes(shape, "root", { left: 70 });

    expect(next.kind).toBe("split");
    if (next.kind !== "split") return;
    expect(next.children[0].defaultSize).toBe(70);
    expect(next.children[1].defaultSize).toBe(50);
  });

  it("recurses into nested splits to find the target", () => {
    const shape: ShapeNode = {
      kind: "split",
      id: "root",
      orientation: "horizontal",
      children: [
        { kind: "tabs", id: "left", tabKeys: ["a"] },
        {
          kind: "split",
          id: "right-column",
          orientation: "vertical",
          children: [
            { kind: "tabs", id: "top", tabKeys: ["b"], defaultSize: 50 },
            { kind: "tabs", id: "bottom", tabKeys: ["c"], defaultSize: 50 },
          ],
        },
      ],
    };

    const next = updateSplitSizes(shape, "right-column", { top: 30 });

    const rightColumn = next.kind === "split" ? next.children[1] : null;
    expect(rightColumn?.kind).toBe("split");
    if (rightColumn?.kind === "split") {
      expect(rightColumn.children[0].defaultSize).toBe(30);
      expect(rightColumn.children[1].defaultSize).toBe(50);
    }
  });
});
