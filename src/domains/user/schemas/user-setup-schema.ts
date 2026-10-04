import { z } from "zod";
import { usernameSchema } from "./username-schema";

export const userSetupSchema = z.object({
  username: usernameSchema,
});
