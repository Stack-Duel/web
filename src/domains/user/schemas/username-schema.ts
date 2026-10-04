import { z } from "zod";

// Mirrors Algowars.Domain.Users.ValueObjects.Username (min 1, max 20 chars).
export const usernameSchema = z
  .string()
  .min(1, "Username must be at least one character")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[A-Za-z0-9_-]+$/, {
    message: "Username only allows letters, numbers, hyphens, and underscores",
  });
