import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditorSettingsMenu from "./editor-settings-menu";
import { useEditorSettingsStore } from "../state/editor-settings-store";

describe("EditorSettingsMenu", () => {
  beforeEach(() => {
    localStorage.clear();
    useEditorSettingsStore.setState({ tabSize: 4, indentType: "spaces" });
  });

  it("updates the indent type when a menu option is selected", async () => {
    const user = userEvent.setup();
    render(<EditorSettingsMenu />);

    await user.click(
      screen.getByRole("button", { name: "Editor indentation settings" })
    );
    await user.click(
      await screen.findByRole("menuitemradio", { name: "Tabs" })
    );

    expect(useEditorSettingsStore.getState().indentType).toBe("tabs");
  });

  it("updates the tab size when a menu option is selected", async () => {
    const user = userEvent.setup();
    render(<EditorSettingsMenu />);

    await user.click(
      screen.getByRole("button", { name: "Editor indentation settings" })
    );
    const menu = screen.getByRole("menu");
    await user.click(within(menu).getByRole("menuitemradio", { name: "2" }));

    expect(useEditorSettingsStore.getState().tabSize).toBe(2);
  });
});
