"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { useNewStudioProblemStore } from "../new-studio-problem-store";
import { Input } from "@/shared/components/ui/input";
import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { normalizeText } from "@/shared/utils/normalize-text";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  MAX_TAG_COUNT,
  TAG_MAX_LENGTH,
  TAG_MIN_LENGTH,
} from "../new-studio-problem-schema";

export default function StudioProblemTagsField({
  field,
}: Readonly<{ field: AnyFieldApi }>) {
  const addTag = useNewStudioProblemStore((store) => store.addTag);
  const removeTag = useNewStudioProblemStore((store) => store.removeTag);
  const clearTags = useNewStudioProblemStore((store) => store.clearTags);

  const [draftTag, setDraftTag] = useState("");

  const tags = field.state.value as string[];
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const isAtTagLimit = tags.length >= MAX_TAG_COUNT;

  const syncTagsFromStore = () => {
    field.handleChange(useNewStudioProblemStore.getState().tags);
  };

  const addDraftTag = () => {
    const normalized = normalizeText(draftTag);
    if (normalized && !tags.includes(normalized) && !isAtTagLimit) {
      addTag(normalized);
      syncTagsFromStore();
    }
    setDraftTag("");
  };

  const handleRemoveTag = (tag: string) => {
    removeTag(tag);
    syncTagsFromStore();
  };

  const handleClearTags = () => {
    clearTags();
    syncTagsFromStore();
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
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor="tags">Tags</FieldLabel>
      <ul className="flex items-center gap-2">
        {tags.map((tag) => (
          <li key={tag}>
            <Badge variant="secondary" className="gap-1 pr-1">
              {tag}{" "}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
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
        minLength={TAG_MIN_LENGTH}
        maxLength={TAG_MAX_LENGTH}
        value={draftTag}
        disabled={isAtTagLimit}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          addDraftTag();
          field.handleBlur();
        }}
        onChange={(e) => setDraftTag(e.target.value)}
        aria-invalid={isInvalid}
      />
      {isInvalid ? (
        <FieldError errors={field.state.meta.errors} />
      ) : (
        <FieldDescription>
          1 to {MAX_TAG_COUNT} tags. Lowercase letters, numbers, and hyphens
          only.
        </FieldDescription>
      )}
      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleClearTags}
        >
          Clear Tags
        </Button>
      </div>
    </Field>
  );
}
