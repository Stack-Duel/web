"use client";

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
} from "../../new/new-studio-problem-schema";
import { useStudioProblemEditStore } from "../studio-problem-edit-store-context";
import {
  selectQuestion,
  selectQuestionError,
} from "../studio-problem-edit-store";

export default function StudioProblemEditQuestionField() {
  const question = useStudioProblemEditStore(selectQuestion);
  const error = useStudioProblemEditStore(selectQuestionError);
  const changeQuestion = useStudioProblemEditStore(
    (state) => state.changeQuestion
  );
  const touchField = useStudioProblemEditStore((state) => state.touchField);

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="studio-problem-question">Question</FieldLabel>
      <Textarea
        id="studio-problem-question"
        name="question"
        minLength={QUESTION_MIN_LENGTH}
        maxLength={QUESTION_MAX_LENGTH}
        value={question}
        onChange={(e) => changeQuestion(e.target.value)}
        onBlur={() => touchField("question")}
        className="min-h-64 font-mono text-sm"
        aria-invalid={!!error}
      />
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        <FieldDescription className="flex items-center gap-3">
          Between {QUESTION_MIN_LENGTH} and {QUESTION_MAX_LENGTH} characters.
          <span className="ml-auto">
            {question.length} of {QUESTION_MAX_LENGTH}
          </span>
        </FieldDescription>
      )}
    </Field>
  );
}
