"use client";

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
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Time limit (ms)</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type="number"
        min={TIME_LIMIT_MIN_MS}
        max={TIME_LIMIT_MAX_MS}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          const value = Number.isNaN(parsed)
            ? field.state.value
            : clampNumber(parsed, TIME_LIMIT_MIN_MS, TIME_LIMIT_MAX_MS);
          field.handleChange(value);
          changeTimeLimitMs(value);
        }}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
