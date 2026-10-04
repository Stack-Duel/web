import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    APP_BASE_URL: z.string().url(),
  },
  client: {},
  runtimeEnv: {
    APP_BASE_URL: process.env.APP_BASE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
