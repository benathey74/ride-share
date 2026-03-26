"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CarFront,
  Home,
  LayoutDashboard,
  Search,
  Shield,
  UserRound,
  Waypoints,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BottomNavItem, NavIconMap } from "@/lib/navigation/types";

const ICONS: NavIconMap = {
  home: Home,
  search: Search,
  trips: CarFront,
  dashboard: LayoutDashboard,
  driverRoutes: Waypoints,
  admin: Shield,
  profile: UserRound,
};

type BottomNavProps = {
  items: BottomNavItem[];
  className?: string;
};

function pathnameMatchesDriveSlot(pathname: string): boolean {
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname === "/routes" || pathname.startsWith("/routes/")) return true;
  if (pathname.startsWith("/onboarding/finish")) return true;
  if (pathname.startsWith("/onboarding/driver")) return true;
  if (/^\/trips\/[^/]+\/requests/.test(pathname)) return true;
  return false;
}

export function BottomNav({ items, className }: BottomNavProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className={cn(
        "sticky bottom-0 z-40 border-t border-border/80 bg-card/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md",
        className,
      )}
      aria-label="Primary"
    >
      <ul className="mx-auto flex w-full max-w-full items-stretch justify-around px-2">
        {items.map(({ id, href, label, icon, badge, onBeforeNavigate, driveSlot }) => {
          const Icon = ICONS[icon];
          const active = driveSlot
            ? pathnameMatchesDriveSlot(pathname)
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={id ?? href} className="flex-1">
              <Link
                href={href}
                scroll={false}
                onClick={() => {
                  onBeforeNavigate?.();
                }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
                    active ? "bg-primary/12 text-primary" : "bg-transparent",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  {badge ? (
                    <span
                      className={cn(
                        "absolute -right-0.5 -top-0.5 max-w-[2.25rem] truncate rounded-full px-1 py-px text-[7px] font-bold uppercase leading-none",
                        badge === "Fix" || badge === "Off"
                          ? "bg-destructive/90 text-destructive-foreground"
                          : badge === "Wait"
                            ? "bg-amber-500 text-amber-950"
                            : "bg-primary/90 text-primary-foreground",
                      )}
                      title={badge}
                    >
                      {badge}
                    </span>
                  ) : null}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
