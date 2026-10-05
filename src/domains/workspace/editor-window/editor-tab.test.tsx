import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorWindowTab } from "./editor-tab";

/** Simulates a file already having been dragged into its own split pane,
 *  separate from where it started. The exact scenario `focusRequest` exists
 *  to handle, since the drag arrangement is private local state the file
 *  explorer has no other way to address. */
const alreadySplitTab = {
  orientation: "horizontal" as const,
  children: [
    {
      key: "solution-group",
      children: [
        { key: "main", name: "Solution.jsx", component: <p>Main file</p> },
      ],
    },
    {
      key: "helper-group",
      children: [
        {
          key: "Helper.jsx",
          name: "Helper.jsx",
          component: <p>Helper file</p>,
        },
      ],
    },
  ],
};

describe("EditorWindowTab", () => {
  it("renders nothing when there is no tab", () => {
    const { container } = render(
      <EditorWindowTab activeTabByNode={{}} onTabActivate={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a leaf tab's component", () => {
    render(
      <EditorWindowTab
        tab={{ name: "Editor", component: <p>Editor content</p> }}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    expect(screen.getByText("Editor content")).toBeVisible();
  });

  it("renders the active child tab's component based on activeTabByNode", () => {
    render(
      <EditorWindowTab
        tab={{
          children: [
            { key: "a", name: "Editor", component: <p>Editor pane</p> },
            { key: "b", name: "Console", component: <p>Console pane</p> },
          ],
        }}
        activeTabByNode={{ root: 1 }}
        onTabActivate={vi.fn()}
      />
    );

    expect(screen.getByText("Console pane")).toBeVisible();
    expect(screen.queryByText("Editor pane")).not.toBeInTheDocument();
  });

  it("calls onTabActivate with the node id and clicked tab index", async () => {
    const onTabActivate = vi.fn();
    const user = userEvent.setup();

    render(
      <EditorWindowTab
        tab={{
          children: [
            { key: "a", name: "Editor", component: <p>Editor pane</p> },
            { key: "b", name: "Console", component: <p>Console pane</p> },
          ],
        }}
        activeTabByNode={{}}
        onTabActivate={onTabActivate}
      />
    );

    await user.click(screen.getByRole("button", { name: "Console" }));

    expect(onTabActivate).toHaveBeenCalledWith("root", 1);
  });

  it("focuses a tab in its own split pane, wherever it currently lives", () => {
    const onTabActivate = vi.fn();

    render(
      <EditorWindowTab
        tab={alreadySplitTab}
        activeTabByNode={{}}
        onTabActivate={onTabActivate}
        focusRequest={{ key: "Helper.jsx", requestId: 1 }}
      />
    );

    expect(onTabActivate).toHaveBeenCalledWith("helper-group", 0);
  });

  it("re-fires for the same key when requestId changes, so re-clicking an already-focused file still works", () => {
    const onTabActivate = vi.fn();

    const { rerender } = render(
      <EditorWindowTab
        tab={alreadySplitTab}
        activeTabByNode={{}}
        onTabActivate={onTabActivate}
        focusRequest={{ key: "main", requestId: 1 }}
      />
    );
    expect(onTabActivate).toHaveBeenCalledTimes(1);

    rerender(
      <EditorWindowTab
        tab={alreadySplitTab}
        activeTabByNode={{}}
        onTabActivate={onTabActivate}
        focusRequest={{ key: "main", requestId: 2 }}
      />
    );
    expect(onTabActivate).toHaveBeenCalledTimes(2);
  });

  it("does nothing for a focusRequest key that isn't in the tree", () => {
    const onTabActivate = vi.fn();

    render(
      <EditorWindowTab
        tab={alreadySplitTab}
        activeTabByNode={{}}
        onTabActivate={onTabActivate}
        focusRequest={{ key: "does-not-exist", requestId: 1 }}
      />
    );

    expect(onTabActivate).not.toHaveBeenCalled();
  });

  it("recursively renders an orientation split's children", () => {
    render(
      <EditorWindowTab
        tab={{
          orientation: "horizontal",
          children: [
            {
              key: "left",
              name: "Editor",
              component: <p>Left pane</p>,
            },
            {
              key: "right",
              name: "Console",
              component: <p>Right pane</p>,
            },
          ],
        }}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    expect(screen.getByText("Left pane")).toBeVisible();
    expect(screen.getByText("Right pane")).toBeVisible();
  });
});
