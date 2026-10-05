"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";

function normalizeTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type AdminProblemTagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

export default function AdminProblemTagInput({
  tags,
  onChange,
}: Readonly<AdminProblemTagInputProps>) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const normalized = normalizeTag(draft);
    if (normalized && !tags.includes(normalized)) {
      onChange([...tags, normalized]);
    }
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              aria-label={`Remove ${tag}`}
            >
              <X size={12} />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder="Add a tag and press Enter..."
      />
    </div>
  );
}
