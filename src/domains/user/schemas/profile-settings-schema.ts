import { z } from "zod";
import { usernameSchema } from "./username-schema";

export const profileSettingsSchema = z.object({
  username: usernameSchema,
  bio: z.string().max(500, "Bio must be at most 500 characters"),
});
