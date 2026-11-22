"use client";

import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { clampNumber } from "@/shared/utils/clamp-number";
import {
  DIFFICULTY_MAX,
  DIFFICULTY_MIN,
} from "../../new/new-studio-problem-schema";
import { useStudioProblemEditStore } from "../studio-problem-edit-store-context";
import {
  selectEstimatedDifficulty,
  selectEstimatedDifficultyError,
} from "../studio-problem-edit-store";

export default function StudioProblemEditDifficultyField() {
  const estimatedDifficulty = useStudioProblemEditStore(
    selectEstimatedDifficulty
  );
  const error = useStudioProblemEditStore(selectEstimatedDifficultyError);
  const changeEstimatedDifficulty = useStudioProblemEditStore(
    (state) => state.changeEstimatedDifficulty
  );
  const touchField = useStudioProblemEditStore((state) => state.touchField);

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="studio-problem-difficulty">Difficulty</FieldLabel>
      <Input
        id="studio-problem-difficulty"
        name="estimatedDifficulty"
        type="number"
        min={DIFFICULTY_MIN}
        max={DIFFICULTY_MAX}
        value={estimatedDifficulty}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          if (Number.isNaN(parsed)) return;
          changeEstimatedDifficulty(
            clampNumber(parsed, DIFFICULTY_MIN, DIFFICULTY_MAX)
          );
        }}
        onBlur={() => touchField("estimatedDifficulty")}
        aria-invalid={!!error}
      />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
