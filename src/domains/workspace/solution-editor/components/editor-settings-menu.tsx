"use client";

import { Settings2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  TAB_SIZE_OPTIONS,
  useEditorSettingsStore,
  selectTabSize,
  selectIndentType,
  type IndentType,
} from "../state/editor-settings-store";

export default function EditorSettingsMenu() {
  const tabSize = useEditorSettingsStore(selectTabSize);
  const indentType = useEditorSettingsStore(selectIndentType);
  const setTabSize = useEditorSettingsStore((s) => s.setTabSize);
  const setIndentType = useEditorSettingsStore((s) => s.setIndentType);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Editor indentation settings"
        >
          <Settings2 />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Indent using</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={indentType}
          onValueChange={(value) => setIndentType(value as IndentType)}
        >
          <DropdownMenuRadioItem value="spaces">Spaces</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="tabs">Tabs</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Tab size</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={String(tabSize)}
          onValueChange={(value) => setTabSize(Number(value))}
        >
          {TAB_SIZE_OPTIONS.map((size) => (
            <DropdownMenuRadioItem key={size} value={String(size)}>
              {size}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
