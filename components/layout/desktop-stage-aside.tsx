import { MapPin, Shield, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

type DesktopStageAsideProps = {
  className?: string;
};

/**
 * Desktop-only contextual panel — does not replace navigation or core flows.
 */
export function DesktopStageAside({ className }: DesktopStageAsideProps) {
  return (
    <aside
      className={cn(
        "hidden w-full max-w-[min(100%,20rem)] flex-col justify-center gap-6 lg:flex xl:max-w-[22rem]",
        className,
      )}
      role="complementary"
      aria-label="Layout and privacy notes"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-6 shadow-soft">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-secondary/10 blur-2xl"
          aria-hidden
        />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Smartphone className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Same app, framed
            </p>
          </div>
          <p className="text-sm font-semibold leading-snug text-foreground">
            You&apos;re using the mobile layout — centered so it feels familiar on a
            large screen.
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>Alias + avatar only in shared views; exact pickup after match.</span>
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
              <span>Bottom nav stays the primary way to move around.</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
