import { create } from "zustand";
import { persist } from "zustand/middleware";

export type IndentType = "spaces" | "tabs";

export const TAB_SIZE_OPTIONS = [2, 4, 8] as const;

interface EditorSettingsState {
  tabSize: number;
  indentType: IndentType;
  setTabSize: (tabSize: number) => void;
  setIndentType: (indentType: IndentType) => void;
}

export const useEditorSettingsStore = create<EditorSettingsState>()(
  persist(
    (set) => ({
      tabSize: 4,
      indentType: "spaces",
      setTabSize: (tabSize) => set({ tabSize }),
      setIndentType: (indentType) => set({ indentType }),
    }),
    { name: "algowars-editor-settings" }
  )
);

export const selectTabSize = (s: EditorSettingsState) => s.tabSize;
export const selectIndentType = (s: EditorSettingsState) => s.indentType;
