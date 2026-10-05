import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorWindowPanelHeader } from "./editor-panel-header";

describe("EditorWindowPanelHeader", () => {
  it("renders a single tab name with its header component when there are no children", () => {
    render(
      <EditorWindowPanelHeader
        tab={{ name: "Console", headerComponent: <button>Clear</button> }}
        currentTabIndex={0}
        setCurrentTab={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /Console/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear" })).toBeVisible();
  });

  it("renders a button per child tab and highlights the active one", () => {
    render(
      <EditorWindowPanelHeader
        tab={{
          children: [
            { key: "a", name: "Editor" },
            { key: "b", name: "Console" },
          ],
        }}
        currentTabIndex={1}
        setCurrentTab={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Editor" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Console" })).toBeVisible();
  });

  it("calls setCurrentTab with the clicked tab's index", async () => {
    const setCurrentTab = vi.fn();
    const user = userEvent.setup();

    render(
      <EditorWindowPanelHeader
        tab={{
          children: [
            { key: "a", name: "Editor" },
            { key: "b", name: "Console" },
          ],
        }}
        currentTabIndex={0}
        setCurrentTab={setCurrentTab}
      />
    );

    await user.click(screen.getByRole("button", { name: "Console" }));

    expect(setCurrentTab).toHaveBeenCalledWith(1);
  });

  it("does not render a close button for a tab without onClose", () => {
    render(
      <EditorWindowPanelHeader
        tab={{ children: [{ key: "a", name: "Editor" }] }}
        currentTabIndex={0}
        setCurrentTab={vi.fn()}
      />
    );

    expect(
      screen.queryByRole("button", { name: /close/i })
    ).not.toBeInTheDocument();
  });

  it("closes a tab via its close button without switching to it", async () => {
    const onClose = vi.fn();
    const setCurrentTab = vi.fn();
    const user = userEvent.setup();

    render(
      <EditorWindowPanelHeader
        tab={{
          children: [
            { key: "a", name: "Editor" },
            { key: "b", name: "Helper.jsx", onClose },
          ],
        }}
        currentTabIndex={0}
        setCurrentTab={setCurrentTab}
      />
    );

    await user.click(screen.getByRole("button", { name: "Close Helper.jsx" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(setCurrentTab).not.toHaveBeenCalled();
  });
});
