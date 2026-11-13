"use client";

import { Label } from "@/shared/components/ui/label";
import {
  selectTags,
  useNewStudioProblemStore,
} from "../new-studio-problem-store";
import { Input } from "@/shared/components/ui/input";
import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { normalizeText } from "@/shared/utils/normalize-text";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function StudioProblemTagsField() {
  const tags = useNewStudioProblemStore(selectTags);

  const addTag = useNewStudioProblemStore((store) => store.addTag);
  const removeTag = useNewStudioProblemStore((store) => store.removeTag);
  const clearTags = useNewStudioProblemStore((store) => store.clearTags);

  const [draftTag, setDraftTag] = useState("");

  const addDraftTag = () => {
    const normalized = normalizeText(draftTag);
    if (normalized && !tags.includes(normalized)) {
      addTag(normalized);
    }
    setDraftTag("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDraftTag();
    } else if (
      e.key === "Backspace" &&
      draftTag === "" &&
      draftTag.length > 0
    ) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="tags">Tags</Label>
      <ul className="flex items-center gap-2">
        {tags.map((tag) => (
          <li key={tag}>
            <Badge variant="secondary" className="gap-1 pr-1">
              {tag}{" "}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${tag}`}
              >
                <X size={12} />
              </button>
            </Badge>
          </li>
        ))}
      </ul>
      <Input
        id="tags"
        minLength={1}
        maxLength={50}
        value={draftTag}
        onKeyDown={handleKeyDown}
        onBlur={addDraftTag}
        onChange={(e) => setDraftTag(e.target.value)}
      />
      <Button variant="secondary" size="sm" onClick={clearTags}>
        Clear Tags
      </Button>
    </div>
  );
}
