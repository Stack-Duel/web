import { z } from "zod";
import { usernameSchema } from "./username-schema";

// Bio max length mirrors Algowars.Domain.Users.ValueObjects.Bio (500 chars).
export const profileSettingsSchema = z.object({
  username: usernameSchema,
  bio: z.string().max(500, "Bio must be at most 500 characters"),
});
