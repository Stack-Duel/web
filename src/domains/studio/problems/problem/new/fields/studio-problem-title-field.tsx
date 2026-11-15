"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from "../new-studio-problem-schema";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

export default function StudioProblemTitleField({
  field,
}: Readonly<{ field: AnyFieldApi }>) {
  const changeTitle = useNewStudioProblemStore((state) => state.changeTitle);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        minLength={TITLE_MIN_LENGTH}
        maxLength={TITLE_MAX_LENGTH}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          field.handleChange(e.target.value);
          changeTitle(e.target.value);
        }}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
