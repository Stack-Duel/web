import { beforeEach, describe, expect, it } from "vitest";
import {
  useEditorSettingsStore,
  selectTabSize,
  selectIndentType,
} from "./editor-settings-store";

describe("editor-settings-store", () => {
  beforeEach(() => {
    localStorage.clear();
    useEditorSettingsStore.setState({ tabSize: 4, indentType: "spaces" });
  });

  it("defaults to 4-space indentation", () => {
    const state = useEditorSettingsStore.getState();

    expect(selectTabSize(state)).toBe(4);
    expect(selectIndentType(state)).toBe("spaces");
  });

  it("updates the tab size", () => {
    useEditorSettingsStore.getState().setTabSize(2);

    expect(selectTabSize(useEditorSettingsStore.getState())).toBe(2);
  });

  it("updates the indent type", () => {
    useEditorSettingsStore.getState().setIndentType("tabs");

    expect(selectIndentType(useEditorSettingsStore.getState())).toBe("tabs");
  });

  it("persists changes to localStorage", () => {
    useEditorSettingsStore.getState().setTabSize(8);

    const stored = JSON.parse(
      localStorage.getItem("algowars-editor-settings") ?? "{}"
    );
    expect(stored.state.tabSize).toBe(8);
  });
});
