"use client";

import { useTheme } from "next-themes";
import { toast } from "sonner";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { Button } from "@/shared/components/ui/button";
import { Copy } from "lucide-react";
import type { Track } from "@/domains/game/models/track";

const jsonEditorExtensions = [json(), EditorView.lineWrapping];

async function copyToClipboard(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error("Could not copy to clipboard");
  }
}

type NewStudioProblemUploadJsonContentProps = {
  text: string;
  onTextChange: (value: string) => void;
  availableTracks: Track[];
  promptTemplate: string;
};

export default function NewStudioProblemUploadJsonContent({
  text,
  onTextChange,
  availableTracks,
  promptTemplate,
}: Readonly<NewStudioProblemUploadJsonContentProps>) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Available tracks</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              copyToClipboard(promptTemplate, "Copied JSON structure")
            }
          >
            <Copy className="me-1" size={14} />
            Copy structure
          </Button>
        </div>
        <div className="max-h-40 overflow-y-auto rounded-lg border p-2">
          {availableTracks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tracks are available yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {availableTracks.map((track) => (
                <li key={track.id} className="text-sm">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(track.id, `Copied "${track.name}" id`)
                    }
                    className="flex items-center gap-1.5 font-mono text-xs hover:text-primary"
                  >
                    <Copy size={12} />
                    {track.id}
                  </button>
                  <span className="text-muted-foreground"> - {track.name}</span>
                  {track.languages.length > 0 && (
                    <ul className="ms-5 mt-1 space-y-1">
                      {track.languages.map((language) => (
                        <li key={language.id}>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                language.id,
                                `Copied "${language.name}" id`
                              )
                            }
                            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary"
                          >
                            <Copy size={11} />
                            {language.id}
                          </button>
                          <span className="text-muted-foreground">
                            {" "}
                            - {language.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="min-w-0 space-y-1.5">
        <p className="text-sm font-medium">Paste problem JSON</p>
        <div className="min-w-0 overflow-hidden rounded-lg border text-xs">
          <CodeMirror
            value={text}
            onChange={onTextChange}
            extensions={jsonEditorExtensions}
            placeholder={promptTemplate}
            height="240px"
            theme={resolvedTheme === "light" ? vscodeLight : vscodeDark}
            basicSetup={{ foldGutter: false }}
          />
        </div>
      </div>
    </div>
  );
}
