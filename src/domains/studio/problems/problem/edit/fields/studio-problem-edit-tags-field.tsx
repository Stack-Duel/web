"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { normalizeText } from "@/shared/utils/normalize-text";
import {
  MAX_TAG_COUNT,
  MIN_TAG_COUNT,
  TAG_MAX_LENGTH,
  TAG_MIN_LENGTH,
} from "../../new/new-studio-problem-schema";
import { useStudioProblemEditStore } from "../studio-problem-edit-store-context";
import { selectTags, selectTagsError } from "../studio-problem-edit-store";

export default function StudioProblemEditTagsField() {
  const tags = useStudioProblemEditStore(selectTags);
  const error = useStudioProblemEditStore(selectTagsError);
  const addTag = useStudioProblemEditStore((state) => state.addTag);
  const removeTag = useStudioProblemEditStore((state) => state.removeTag);
  const touchField = useStudioProblemEditStore((state) => state.touchField);

  const [draftTag, setDraftTag] = useState("");

  const isAtTagLimit = tags.length >= MAX_TAG_COUNT;

  const commitDraftTag = () => {
    const normalized = normalizeText(draftTag);
    if (normalized && !isAtTagLimit) addTag(normalized);
    setDraftTag("");
    touchField("tags");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraftTag();
    } else if (e.key === "Backspace" && draftTag === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="studio-problem-tags">Tags</FieldLabel>
      {tags.length > 0 && (
        <ul className="flex min-w-0 flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <li key={tag} className="min-w-0 max-w-full">
              <Badge variant="secondary" className="max-w-full gap-1 pr-1">
                <span className="min-w-0 truncate" title={tag}>
                  {tag}
                </span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="shrink-0 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={`Remove ${tag}`}
                >
                  <X size={12} />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <Input
        id="studio-problem-tags"
        minLength={TAG_MIN_LENGTH}
        maxLength={TAG_MAX_LENGTH}
        value={draftTag}
        disabled={isAtTagLimit}
        placeholder={isAtTagLimit ? "Tag limit reached" : "Add a tag"}
        onKeyDown={handleKeyDown}
        onBlur={commitDraftTag}
        onChange={(e) => setDraftTag(e.target.value)}
        aria-invalid={!!error}
      />
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        <FieldDescription>
          {MIN_TAG_COUNT} to {MAX_TAG_COUNT} tags, lowercase and hyphenated.
        </FieldDescription>
      )}
    </Field>
  );
}
