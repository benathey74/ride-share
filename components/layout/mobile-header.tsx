import * as React from "react";
import { cn } from "@/lib/utils";

type MobileHeaderProps = {
  title: string;
  right?: React.ReactNode;
  className?: string;
};

export function MobileHeader({ title, right, className }: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-card/90 px-4 backdrop-blur-md",
        className,
      )}
    >
      <h1 className="truncate text-base font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {right ? (
        <div className="flex shrink-0 items-center gap-2">{right}</div>
      ) : null}
    </header>
  );
}
