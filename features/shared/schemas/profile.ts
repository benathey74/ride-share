import { z } from "zod";

export const profileFormSchema = z.object({
  alias: z
    .string()
    .min(3, "Alias must be at least 3 characters")
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  avatarEmoji: z.string().min(1, "Pick an avatar").max(128),
  bio: z.string().max(4000).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
