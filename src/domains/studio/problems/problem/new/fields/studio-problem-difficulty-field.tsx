"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { clampNumber } from "@/shared/utils/clamp-number";
import { DIFFICULTY_MAX, DIFFICULTY_MIN } from "../new-studio-problem-schema";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

export default function StudioProblemDifficultyField({
  field,
}: Readonly<{ field: AnyFieldApi }>) {
  const changeEstimatedDifficulty = useNewStudioProblemStore(
    (state) => state.changeEstimatedDifficulty
  );
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Difficulty</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type="number"
        min={DIFFICULTY_MIN}
        max={DIFFICULTY_MAX}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          const value = Number.isNaN(parsed)
            ? field.state.value
            : clampNumber(parsed, DIFFICULTY_MIN, DIFFICULTY_MAX);
          field.handleChange(value);
          changeEstimatedDifficulty(value);
        }}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
