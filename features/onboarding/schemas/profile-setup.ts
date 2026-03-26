import { z } from "zod";

/** Public identity + org-only account fields (no phone on this step — use Profile later if needed). */
export const onboardingProfileSetupSchema = z
  .object({
    alias: z
      .string()
      .min(3, "Alias must be at least 3 characters")
      .max(64)
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
    avatarEmoji: z.string().min(1, "Pick an avatar").max(128),
    departmentTeam: z.string().trim().max(120),
    emergencyContactName: z.string().trim().max(120),
    emergencyContactPhone: z.string().trim().max(32),
  })
  .superRefine((val, ctx) => {
    const hasName = val.emergencyContactName.trim().length > 0;
    const hasPhone = val.emergencyContactPhone.trim().length > 0;
    if (hasName !== hasPhone) {
      ctx.addIssue({
        code: "custom",
        message: "Provide both emergency name and phone, or leave both blank",
        path: hasName ? ["emergencyContactPhone"] : ["emergencyContactName"],
      });
    }
  });

export type OnboardingProfileSetupValues = z.infer<typeof onboardingProfileSetupSchema>;
