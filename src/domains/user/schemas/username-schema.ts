import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(1, "Username must be at least one character")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[A-Za-z0-9_-]+$/, {
    message: "Username only allows letters, numbers, hyphens, and underscores",
  });
