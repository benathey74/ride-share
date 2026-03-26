import { z } from "zod";

export const onboardingWelcomeSchema = z.object({
  role: z.enum(["passenger", "driver", "both"], {
    message: "Choose how you want to use Rides",
  }),
});

export type OnboardingWelcomeValues = z.infer<typeof onboardingWelcomeSchema>;
