import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Workspace from "./workspace";
import { useWorkspaceStore } from "../state/workspace-store";

const initialState = useWorkspaceStore.getState();

describe("Workspace", () => {
  beforeEach(() => {
    useWorkspaceStore.setState(initialState, true);
  });

  it("renders the tab tree wired to the workspace store's active tab state", async () => {
    const user = userEvent.setup();

    render(
      <Workspace
        tab={{
          children: [
            { key: "a", name: "Editor", component: <p>Editor pane</p> },
            { key: "b", name: "Console", component: <p>Console pane</p> },
          ],
        }}
      />
    );

    expect(screen.getByText("Editor pane")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Console" }));

    expect(screen.getByText("Console pane")).toBeVisible();
    expect(useWorkspaceStore.getState().activeTabByNode).toEqual({
      root: 1,
    });
  });
});
