import { z } from "zod";

const setupUploadItemSchema = z.object({
  languageVersionId: z.uuid(
    "languageVersionId must be a language version's id (GUID)"
  ),
  initialCode: z.string().min(1, "initialCode is required"),
  functionName: z.string().nullable(),
  referenceSolutionCode: z.string().min(1, "referenceSolutionCode is required"),
});

export const setupsUploadSchema = z.array(setupUploadItemSchema).min(1);

export type SetupUploadItem = z.infer<typeof setupUploadItemSchema>;
