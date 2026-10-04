import { z } from "zod";

const sampleTestCaseInputUploadSchema = z.object({
  value: z.string().min(1, "value is required"),
  valueType: z.enum([
    "integer",
    "double",
    "boolean",
    "string",
    "integer_array",
  ]),
});

const sampleTestCaseUploadItemSchema = z.object({
  name: z.string().nullable(),
  inputs: z.array(sampleTestCaseInputUploadSchema).min(1),
  expectedOutputValue: z.string().min(1, "expectedOutputValue is required"),
  expectedOutputValueType: z.enum([
    "integer",
    "double",
    "boolean",
    "string",
    "integer_array",
  ]),
});

export const sampleTestCasesUploadSchema = z
  .array(sampleTestCaseUploadItemSchema)
  .min(1);

export type SampleTestCaseUploadItem = z.infer<
  typeof sampleTestCaseUploadItemSchema
>;
