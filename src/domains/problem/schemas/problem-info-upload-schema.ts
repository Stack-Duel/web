import { z } from "zod";

export const problemInfoUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  question: z.string().min(1, "Question is required"),
  difficulty: z.number().int().min(0),
  timeLimitMs: z.number().int().min(100).max(10000),
  memoryLimitMb: z.number().int().min(16).max(512),
  tags: z.array(z.string()),
  trackId: z.uuid("trackId must be a track's id (GUID)"),
});

export type ProblemInfoUpload = z.infer<typeof problemInfoUploadSchema>;
