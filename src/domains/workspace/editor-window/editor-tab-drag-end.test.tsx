import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { EditorWindowTab } from "./editor-tab";
import * as store from "./state/editor-window-store";

type CapturedDragEnd = (event: {
  active: { id: string };
  over?: { id: string };
}) => void;
type CapturedDragStart = (event: { active: { id: string } }) => void;

let capturedOnDragEnd: CapturedDragEnd;
let capturedOnDragStart: CapturedDragStart;
let capturedOnDragCancel: () => void;

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    DndContext: (props: {
      onDragEnd: CapturedDragEnd;
      onDragStart: CapturedDragStart;
      onDragCancel: () => void;
      children: unknown;
    }) => {
      capturedOnDragEnd = props.onDragEnd;
      capturedOnDragStart = props.onDragStart;
      capturedOnDragCancel = props.onDragCancel;
      return props.children;
    },
  };
});

vi.mock("./state/editor-window-store", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./state/editor-window-store")>();
  return {
    ...actual,
    moveTabInShape: vi.fn((shape) => shape),
    splitShapeWithTab: vi.fn((shape) => shape),
    insertSiblingAtIndex: vi.fn((shape) => shape),
    insertAtOuterEdge: vi.fn((shape) => shape),
    updateSplitSizes: vi.fn((shape) => shape),
  };
});

let capturedOnLayoutChanged: (layout: Record<string, number>) => void;

vi.mock("@/shared/components/ui/resizable", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/shared/components/ui/resizable")>();
  return {
    ...actual,
    ResizablePanelGroup: (props: {
      onLayoutChanged: (layout: Record<string, number>) => void;
      [key: string]: unknown;
    }) => {
      capturedOnLayoutChanged = props.onLayoutChanged;
      return <actual.ResizablePanelGroup {...props} />;
    },
  };
});

const splitTab = {
  orientation: "horizontal" as const,
  children: [
    {
      key: "solution-group",
      children: [{ key: "main", name: "Solution.jsx", component: <p>Main</p> }],
    },
    {
      key: "helper-group",
      children: [
        { key: "Helper.jsx", name: "Helper.jsx", component: <p>Helper</p> },
      ],
    },
  ],
};

function dragEnd(active: string, over?: string) {
  act(() => {
    capturedOnDragEnd({
      active: { id: active },
      over: over ? { id: over } : undefined,
    });
  });
}

describe("EditorWindowTab drag-end handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts at the outer edge when dropped on an outer zone", () => {
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    dragEnd("tab:Helper.jsx", "outer:top");

    expect(store.insertAtOuterEdge).toHaveBeenCalledWith(
      expect.anything(),
      "Helper.jsx",
      "top"
    );
  });

  it("splits the panel when dropped on an edge zone", () => {
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    dragEnd("tab:Helper.jsx", "edge:solution-group:left");

    expect(store.splitShapeWithTab).toHaveBeenCalledWith(
      expect.anything(),
      "Helper.jsx",
      "solution-group",
      "left"
    );
  });

  it("inserts a new sibling when dropped on a boundary handle", () => {
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    dragEnd("tab:Helper.jsx", "boundary:root:1");

    expect(store.insertSiblingAtIndex).toHaveBeenCalledWith(
      expect.anything(),
      "Helper.jsx",
      "root",
      1
    );
  });

  it("moves the tab and activates it when dropped on another tab", () => {
    const onTabActivate = vi.fn();
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={onTabActivate}
      />
    );

    dragEnd("tab:Helper.jsx", "tab:main");

    expect(store.moveTabInShape).toHaveBeenCalledWith(
      expect.anything(),
      "Helper.jsx",
      "solution-group",
      0
    );
    expect(onTabActivate).toHaveBeenCalledWith("solution-group", 0);
  });

  it("does nothing when a tab is dropped on itself", () => {
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    dragEnd("tab:Helper.jsx", "tab:Helper.jsx");

    expect(store.moveTabInShape).not.toHaveBeenCalled();
  });

  it("moves the tab into an existing group and activates it", () => {
    const onTabActivate = vi.fn();
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={onTabActivate}
      />
    );

    dragEnd("tab:Helper.jsx", "group:solution-group");

    expect(store.moveTabInShape).toHaveBeenCalledWith(
      expect.anything(),
      "Helper.jsx",
      "solution-group",
      1
    );
    expect(onTabActivate).toHaveBeenCalledWith("solution-group", 1);
  });

  it("does nothing when there is no drop target", () => {
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    dragEnd("tab:Helper.jsx", undefined);

    expect(store.moveTabInShape).not.toHaveBeenCalled();
    expect(store.splitShapeWithTab).not.toHaveBeenCalled();
  });

  it("ignores a drag whose active id isn't a tab", () => {
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    dragEnd("something-else", "tab:main");

    expect(store.moveTabInShape).not.toHaveBeenCalled();
  });

  it("tracks the dragging key from drag start through cancel without crashing", () => {
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    expect(() => {
      act(() => capturedOnDragStart({ active: { id: "tab:Helper.jsx" } }));
      act(() => capturedOnDragCancel());
    }).not.toThrow();
  });

  it("tracks the dragging key from drag start through a completed drop", () => {
    const onTabActivate = vi.fn();
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={onTabActivate}
      />
    );

    act(() => capturedOnDragStart({ active: { id: "tab:Helper.jsx" } }));
    dragEnd("tab:Helper.jsx", "tab:main");

    expect(onTabActivate).toHaveBeenCalledWith("solution-group", 0);
  });

  it("reconciles the existing arrangement when the tab set gains a key, keeping prior keys intact", () => {
    const { rerender } = render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Helper")).toBeInTheDocument();

    rerender(
      <EditorWindowTab
        tab={{
          orientation: "horizontal",
          children: [
            splitTab.children[0],
            {
              key: "helper-group",
              children: [
                ...splitTab.children[1].children,
                {
                  key: "Extra.jsx",
                  name: "Extra.jsx",
                  component: <p>Extra</p>,
                },
              ],
            },
          ],
        }}
        activeTabByNode={{ "helper-group": 1 }}
        onTabActivate={vi.fn()}
      />
    );

    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Extra")).toBeInTheDocument();
  });

  it("resizes the split when a panel group reports a layout change", () => {
    render(
      <EditorWindowTab
        tab={splitTab}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    act(() => {
      capturedOnLayoutChanged({ "solution-group": 60, "helper-group": 40 });
    });

    expect(store.updateSplitSizes).toHaveBeenCalledWith(
      expect.anything(),
      "root",
      { "solution-group": 60, "helper-group": 40 }
    );
  });
});
