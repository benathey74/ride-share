import * as React from "react";
import { DevUserHeaderSlot } from "@/components/dev/dev-user-header-slot";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopStageAside } from "@/components/layout/desktop-stage-aside";
import { MobileHeader } from "@/components/layout/mobile-header";
import type { BottomNavItem } from "@/lib/navigation/types";
import { cn } from "@/lib/utils";

type AppShellProps = {
  title: string;
  headerRight?: React.ReactNode;
  navItems: BottomNavItem[];
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
};

export function AppShell({
  title,
  headerRight,
  navItems,
  children,
  className,
  mainClassName,
}: AppShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-dvh w-full flex-col bg-background text-foreground",
        "md:bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(20,184,166,0.14),transparent),radial-gradient(ellipse_70%_45%_at_100%_40%,rgba(59,130,246,0.09),transparent),radial-gradient(ellipse_50%_40%_at_0%_80%,rgba(245,158,11,0.06),transparent)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-h-dvh flex-1 flex-col",
          "md:items-center md:justify-center md:px-6 md:py-8",
          "lg:px-10 lg:py-10",
        )}
      >
        <div
          className={cn(
            "flex w-full max-w-6xl flex-1 flex-col items-stretch",
            "md:items-center lg:flex-row lg:items-center lg:justify-center lg:gap-10 xl:gap-14",
          )}
        >
          <div
            className={cn(
              "mx-auto flex w-full max-w-[440px] flex-col overflow-hidden",
              /* Full-viewport stack on phones */
              "min-h-dvh",
              /* Framed shell on tablet/desktop */
              "md:min-h-0 md:h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-4rem)]",
              "md:rounded-[2rem] md:border md:border-border/90 md:bg-card md:shadow-shell-desktop md:ring-1 md:ring-slate-900/[0.05]",
            )}
          >
            <div className="flex min-h-dvh flex-1 flex-col md:min-h-0 md:h-full">
              <MobileHeader
                title={title}
                right={
                  <>
                    {headerRight}
                    <DevUserHeaderSlot />
                  </>
                }
              />
              <main
                className={cn(
                  "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-5 md:px-5",
                  mainClassName,
                )}
              >
                {children}
              </main>
              <BottomNav items={navItems} />
            </div>
          </div>

          <DesktopStageAside className="lg:pl-2" />
        </div>
      </div>
    </div>
  );
}
