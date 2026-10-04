import z from "zod";

export const upsertUserSchema = z.object({
  sub: z.string(),
});
