export const onboardingKeys = {
  all: ["onboarding"] as const,
  snapshot: () => [...onboardingKeys.all, "snapshot"] as const,
};
