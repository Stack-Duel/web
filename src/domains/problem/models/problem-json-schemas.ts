import { z } from "zod";
import { GENERATION_VALUE_TYPES } from "./generation-value-types";

const valueTypeSchema = z.enum(GENERATION_VALUE_TYPES);

export const sampleTestCasesJsonSchema = z
  .array(
    z.object({
      name: z.string().nullable().default(null),
      inputs: z
        .array(
          z.object({
            value: z.string(),
            valueType: valueTypeSchema,
          })
        )
        .min(1, "Every case needs at least one input"),
      expectedOutputValue: z.string(),
      expectedOutputValueType: valueTypeSchema,
    })
  )
  .min(1, "Provide at least one sample case");

export const generationParametersJsonSchema = z.object({
  parameters: z
    .array(
      z.object({
        name: z.string().min(1, "Every parameter needs a name"),
        valueType: valueTypeSchema,
        min: z.number().nullable().default(null),
        max: z.number().nullable().default(null),
        lengthMin: z.number().nullable().default(null),
        lengthMax: z.number().nullable().default(null),
        charset: z.string().nullable().default(null),
      })
    )
    .min(1, "Provide at least one parameter"),
  outputValueType: valueTypeSchema,
  targetCaseCount: z.number().int().positive(),
  seed: z.number().int(),
});

export function parseOrThrow<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown
): z.infer<TSchema> {
  const result = schema.safeParse(value);

  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue.path.join(".");
    throw new Error(path ? `${path}: ${issue.message}` : issue.message);
  }

  return result.data;
}
