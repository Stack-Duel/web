"use client";

import { useState } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { clampNumber } from "@/shared/utils/clamp-number";
import {
  MEMORY_LIMIT_MAX_MB,
  MEMORY_LIMIT_MIN_MB,
  TIME_LIMIT_MAX_MS,
  TIME_LIMIT_MIN_MS,
} from "../../new/new-studio-problem-schema";
import { useStudioProblemEditStore } from "../studio-problem-edit-store-context";

const LIMIT_FIELDS = {
  timeLimitMs: {
    label: "Time limit (ms)",
    min: TIME_LIMIT_MIN_MS,
    max: TIME_LIMIT_MAX_MS,
  },
  memoryLimitMB: {
    label: "Memory limit (MB)",
    min: MEMORY_LIMIT_MIN_MB,
    max: MEMORY_LIMIT_MAX_MB,
  },
} as const;

type LimitField = keyof typeof LIMIT_FIELDS;

export default function StudioProblemEditLimitField({
  field,
}: Readonly<{ field: LimitField }>) {
  const { label, min, max } = LIMIT_FIELDS[field];

  const value = useStudioProblemEditStore((state) => state.draft[field]);
  const error = useStudioProblemEditStore((state) =>
    state.touchedFields[field] ? state.fieldErrors[field] : undefined
  );
  const changeLimit = useStudioProblemEditStore((state) =>
    field === "timeLimitMs"
      ? state.changeTimeLimitMs
      : state.changeMemoryLimitMB
  );
  const touchField = useStudioProblemEditStore((state) => state.touchField);
  const isStructuralChange = useStudioProblemEditStore(
    (state) =>
      state.problemStatus === "Published" &&
      state.draft[field] !== state.savedDraft[field]
  );

  const [pendingInput, setPendingInput] = useState<string | null>(null);

  const commitPendingInput = () => {
    const parsed = Number(pendingInput ?? value);
    changeLimit(clampNumber(Number.isFinite(parsed) ? parsed : min, min, max));
    setPendingInput(null);
  };

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={`studio-problem-${field}`}>{label}</FieldLabel>
      <Input
        id={`studio-problem-${field}`}
        name={field}
        type="number"
        min={min}
        max={max}
        value={pendingInput ?? value}
        onChange={(e) => setPendingInput(e.target.value)}
        onBlur={() => {
          commitPendingInput();
          touchField(field);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitPendingInput();
        }}
        aria-invalid={!!error}
      />
      {error && <FieldError>{error}</FieldError>}
      {!error && isStructuralChange && (
        <FieldDescription className="text-amber-600 dark:text-amber-500">
          Changing this on a published problem can invalidate solutions that
          already passed.
        </FieldDescription>
      )}
    </Field>
  );
}
