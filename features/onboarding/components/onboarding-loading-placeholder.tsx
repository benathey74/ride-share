type OnboardingLoadingPlaceholderProps = {
  /** Shown under the spinner (screen readers still use aria-label). */
  message?: string;
  className?: string;
};

/**
 * Shared loading shell for root redirect and onboarding entry while the snapshot resolves.
 */
export function OnboardingLoadingPlaceholder({
  message = "Checking your workspace…",
  className,
}: OnboardingLoadingPlaceholderProps) {
  return (
    <div
      className={
        className ??
        "flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6"
      }
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {message ? (
        <p className="max-w-[260px] text-center text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
