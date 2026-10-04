import { z } from "zod";

const generationParameterUploadItemSchema = z.object({
  name: z.string().min(1, "name is required"),
  valueType: z.enum([
    "integer",
    "double",
    "boolean",
    "string",
    "integer_array",
  ]),
  min: z.number().nullable(),
  max: z.number().nullable(),
  lengthMin: z.number().int().nullable(),
  lengthMax: z.number().int().nullable(),
  charset: z.string().nullable(),
});

export const generationParametersUploadSchema = z.object({
  parameters: z.array(generationParameterUploadItemSchema).min(1),
  outputValueType: z.enum([
    "integer",
    "double",
    "boolean",
    "string",
    "integer_array",
  ]),
  targetCaseCount: z.number().int().min(1),
  seed: z.number().int(),
});

export type GenerationParametersUpload = z.infer<
  typeof generationParametersUploadSchema
>;
