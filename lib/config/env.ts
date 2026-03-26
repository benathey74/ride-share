import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().url().optional(),
  ),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

/**
 * Validated public env (client-safe). Extend when you add NEXT_PUBLIC_* vars.
 */
export function getPublicEnv(): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}
