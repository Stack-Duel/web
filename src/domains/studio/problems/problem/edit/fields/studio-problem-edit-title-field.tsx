"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from "../../new/new-studio-problem-schema";
import { useStudioProblemEditStore } from "../studio-problem-edit-store-context";
import { selectTitle, selectTitleError } from "../studio-problem-edit-store";

export default function StudioProblemEditTitleField() {
  const title = useStudioProblemEditStore(selectTitle);
  const error = useStudioProblemEditStore(selectTitleError);
  const changeTitle = useStudioProblemEditStore((state) => state.changeTitle);
  const touchField = useStudioProblemEditStore((state) => state.touchField);

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="studio-problem-title">Title</FieldLabel>
      <Input
        id="studio-problem-title"
        name="title"
        minLength={TITLE_MIN_LENGTH}
        maxLength={TITLE_MAX_LENGTH}
        value={title}
        onChange={(e) => changeTitle(e.target.value)}
        onBlur={() => touchField("title")}
        aria-invalid={!!error}
      />
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        <FieldDescription className="text-right">
          {title.length} / {TITLE_MAX_LENGTH}
        </FieldDescription>
      )}
    </Field>
  );
}
