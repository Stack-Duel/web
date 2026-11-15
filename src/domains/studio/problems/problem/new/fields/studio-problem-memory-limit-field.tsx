"use client";

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
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Memory limit (MB)</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type="number"
        min={MEMORY_LIMIT_MIN_MB}
        max={MEMORY_LIMIT_MAX_MB}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          const value = Number.isNaN(parsed)
            ? field.state.value
            : clampNumber(parsed, MEMORY_LIMIT_MIN_MB, MEMORY_LIMIT_MAX_MB);
          field.handleChange(value);
          changeMemoryLimitMB(value);
        }}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
