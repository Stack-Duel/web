"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  QUESTION_MAX_LENGTH,
  QUESTION_MIN_LENGTH,
} from "../new-studio-problem-schema";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

export default function StudioProblemQuestionField({
  field,
}: Readonly<{ field: AnyFieldApi }>) {
  const changeQuestion = useNewStudioProblemStore(
    (state) => state.changeQuestion
  );
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Question</FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        minLength={QUESTION_MIN_LENGTH}
        maxLength={QUESTION_MAX_LENGTH}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          field.handleChange(e.target.value);
          changeQuestion(e.target.value);
        }}
        className="min-h-64 font-mono text-sm"
        aria-invalid={isInvalid}
      />
      {isInvalid ? (
        <FieldError errors={field.state.meta.errors} />
      ) : (
        <FieldDescription className="flex items-center gap-3">
          Between {QUESTION_MIN_LENGTH} and {QUESTION_MAX_LENGTH} characters.
          <span className="ml-auto">
            {field.state.value.length} of {QUESTION_MAX_LENGTH}
          </span>
        </FieldDescription>
      )}
    </Field>
  );
}
