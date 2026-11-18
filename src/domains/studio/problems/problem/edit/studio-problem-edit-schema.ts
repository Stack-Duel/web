import { z } from "zod";
import { newStudioProblemSchema } from "../new/new-studio-problem-schema";

export const studioProblemEditSchema = newStudioProblemSchema.pick({
  title: true,
  question: true,
  estimatedDifficulty: true,
  timeLimitMs: true,
  memoryLimitMB: true,
  tags: true,
});

export type StudioProblemEditValues = z.infer<typeof studioProblemEditSchema>;

export type StudioProblemEditField = keyof StudioProblemEditValues;

export function validateStudioProblemEditField<
  TField extends StudioProblemEditField,
>(field: TField, value: StudioProblemEditValues[TField]) {
  const result = studioProblemEditSchema.shape[field].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}
