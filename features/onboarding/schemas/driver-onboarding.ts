import { z } from "zod";

export const onboardingDriverSchema = z.object({
  vehicleMake: z.string().trim().min(1, "Required").max(80),
  vehicleModel: z.string().trim().min(1, "Required").max(80),
  vehicleColor: z.string().trim().min(1, "Required").max(48),
  plateNumber: z.string().trim().min(2, "Required").max(32),
  seatsTotal: z.number().int().min(1).max(20),
  detourToleranceMinutes: z.number().int().min(0).max(120),
  pickupRadiusMeters: z.number().int().min(50).max(5000),
  commuteNotes: z.string().trim().max(2000),
});

export type OnboardingDriverValues = z.infer<typeof onboardingDriverSchema>;
