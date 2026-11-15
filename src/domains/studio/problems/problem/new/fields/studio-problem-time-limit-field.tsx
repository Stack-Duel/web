"use client";

import { useState } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { clampNumber } from "@/shared/utils/clamp-number";
import {
  TIME_LIMIT_MAX_MS,
  TIME_LIMIT_MIN_MS,
} from "../new-studio-problem-schema";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

export default function StudioProblemTimeLimitField({
  field,
}: Readonly<{ field: AnyFieldApi }>) {
  const changeTimeLimitMs = useNewStudioProblemStore(
    (state) => state.changeTimeLimitMs
  );
  const [draft, setDraft] = useState<string | null>(null);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const commitDraft = () => {
    const parsed = Number(draft ?? field.state.value);
    const value = clampNumber(
      Number.isFinite(parsed) ? parsed : TIME_LIMIT_MIN_MS,
      TIME_LIMIT_MIN_MS,
      TIME_LIMIT_MAX_MS
    );
    field.handleChange(value);
    changeTimeLimitMs(value);
    setDraft(null);
  };

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Time limit (ms)</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type="number"
        min={TIME_LIMIT_MIN_MS}
        max={TIME_LIMIT_MAX_MS}
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
