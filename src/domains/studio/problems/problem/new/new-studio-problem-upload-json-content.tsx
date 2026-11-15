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

import {
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  QUESTION_MIN_LENGTH,
  QUESTION_MAX_LENGTH,
  DIFFICULTY_MIN,
  DIFFICULTY_MAX,
  TIME_LIMIT_MIN_MS,
  TIME_LIMIT_MAX_MS,
  MEMORY_LIMIT_MIN_MB,
  MEMORY_LIMIT_MAX_MB,
  MIN_TAG_COUNT,
  MAX_TAG_COUNT,
  TAG_MIN_LENGTH,
  TAG_MAX_LENGTH,
} from "./new-studio-problem-schema";

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
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          <li>
            Title: {TITLE_MIN_LENGTH}–{TITLE_MAX_LENGTH} characters.
          </li>
          <li>
            Question: {QUESTION_MIN_LENGTH}–{QUESTION_MAX_LENGTH} characters;
            Markdown supported.
          </li>
          <li>
            Difficulty: {DIFFICULTY_MIN}–{DIFFICULTY_MAX}.
          </li>
          <li>
            Time limit: {TIME_LIMIT_MIN_MS}–{TIME_LIMIT_MAX_MS} ms.
          </li>
          <li>
            Memory limit: {MEMORY_LIMIT_MIN_MB}–{MEMORY_LIMIT_MAX_MB} MB.
          </li>
          <li>Track ID must match an available track listed above.</li>
          <li>
            {MIN_TAG_COUNT}–{MAX_TAG_COUNT} tags, each {TAG_MIN_LENGTH}–
            {TAG_MAX_LENGTH} lowercase letters, numbers, or hyphens; no leading,
            trailing, or consecutive hyphens.
          </li>
        </ul>
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
