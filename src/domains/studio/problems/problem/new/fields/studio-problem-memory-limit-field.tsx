"use client";

import { useState } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { clampNumber } from "@/shared/utils/clamp-number";
import {
  MEMORY_LIMIT_MAX_MB,
  MEMORY_LIMIT_MIN_MB,
} from "../new-studio-problem-schema";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

export default function StudioProblemMemoryLimitField({
  field,
}: Readonly<{ field: AnyFieldApi }>) {
  const changeMemoryLimitMB = useNewStudioProblemStore(
    (state) => state.changeMemoryLimitMB
  );
  const [draft, setDraft] = useState<string | null>(null);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const commitDraft = () => {
    const parsed = Number(draft ?? field.state.value);
    const value = clampNumber(
      Number.isFinite(parsed) ? parsed : MEMORY_LIMIT_MIN_MB,
      MEMORY_LIMIT_MIN_MB,
      MEMORY_LIMIT_MAX_MB
    );
    field.handleChange(value);
    changeMemoryLimitMB(value);
    setDraft(null);
  };

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Memory limit (MB)</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type="number"
        min={MEMORY_LIMIT_MIN_MB}
        max={MEMORY_LIMIT_MAX_MB}
        value={draft ?? field.state.value}
        onBlur={() => {
          commitDraft();
          field.handleBlur();
        }}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitDraft();
        }}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
