import { z } from "zod";

export const onboardingPassengerSchema = z
  .object({
    commuteDays: z.array(z.number().int().min(0).max(6)),
    preferredMorningTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM (24h)"),
    preferredEveningTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM (24h)"),
    ridePreferences: z.string().trim().max(2000),
  })
  .superRefine((val, ctx) => {
    if (val.commuteDays.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Pick at least one usual commute day",
        path: ["commuteDays"],
      });
    }
  });

export type OnboardingPassengerValues = z.infer<typeof onboardingPassengerSchema>;
