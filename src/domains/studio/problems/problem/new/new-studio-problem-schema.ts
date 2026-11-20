import { z } from "zod";

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 200;
export const QUESTION_MIN_LENGTH = 50;
export const QUESTION_MAX_LENGTH = 10000;
export const DIFFICULTY_MIN = 0;
export const DIFFICULTY_MAX = 4000;
export const TIME_LIMIT_MIN_MS = 100;
export const TIME_LIMIT_MAX_MS = 2000;
export const MEMORY_LIMIT_MIN_MB = 16;
export const MEMORY_LIMIT_MAX_MB = 512;
export const MIN_TAG_COUNT = 1;
export const MAX_TAG_COUNT = 5;
export const TAG_MIN_LENGTH = 1;
export const TAG_MAX_LENGTH = 50;
export const VALID_TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const newStudioProblemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      TITLE_MIN_LENGTH,
      `Title must be at least ${TITLE_MIN_LENGTH} characters`
    )
    .max(
      TITLE_MAX_LENGTH,
      `Title must be at most ${TITLE_MAX_LENGTH} characters`
    ),
  question: z
    .string()
    .trim()
    .min(
      QUESTION_MIN_LENGTH,
      `Question must be at least ${QUESTION_MIN_LENGTH} characters`
    )
    .max(
      QUESTION_MAX_LENGTH,
      `Question must be at most ${QUESTION_MAX_LENGTH} characters`
    ),
  estimatedDifficulty: z
    .number()
    .min(DIFFICULTY_MIN, `Difficulty must be at least ${DIFFICULTY_MIN}`)
    .max(DIFFICULTY_MAX, `Difficulty must be at most ${DIFFICULTY_MAX}`),
  timeLimitMs: z
    .number()
    .min(
      TIME_LIMIT_MIN_MS,
      `Time limit must be at least ${TIME_LIMIT_MIN_MS}ms`
    )
    .max(
      TIME_LIMIT_MAX_MS,
      `Time limit must be at most ${TIME_LIMIT_MAX_MS}ms`
    ),
  memoryLimitMB: z
    .number()
    .min(
      MEMORY_LIMIT_MIN_MB,
      `Memory limit must be at least ${MEMORY_LIMIT_MIN_MB}MB`
    )
    .max(
      MEMORY_LIMIT_MAX_MB,
      `Memory limit must be at most ${MEMORY_LIMIT_MAX_MB}MB`
    ),
  trackId: z.string().min(1, "Track is required"),
  tags: z
    .array(
      z
        .string()
        .min(TAG_MIN_LENGTH)
        .max(TAG_MAX_LENGTH)
        .regex(VALID_TAG_PATTERN)
    )
    .min(MIN_TAG_COUNT, `Add at least ${MIN_TAG_COUNT} tag`)
    .max(MAX_TAG_COUNT, `A problem can have at most ${MAX_TAG_COUNT} tags`),
});

export type NewStudioProblemFormValues = z.infer<typeof newStudioProblemSchema>;
