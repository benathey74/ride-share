"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/layout/section-header";
import { cn } from "@/lib/utils";

type OnboardingBackRowProps = {
  backHref: string;
  backLabel?: string;
  title: string;
  description?: string;
  className?: string;
};

export function OnboardingBackRow({
  backHref,
  backLabel = "Back",
  title,
  description,
  className,
}: OnboardingBackRowProps) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="mt-0.5 shrink-0 rounded-2xl"
        asChild
        aria-label={backLabel}
      >
        <Link href={backHref}>
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </Button>
      <SectionHeader
        title={title}
        description={description}
        className="min-w-0 flex-1 border-0 pb-0"
      />
    </div>
  );
}
