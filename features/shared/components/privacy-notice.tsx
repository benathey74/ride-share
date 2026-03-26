import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { privacyNoticePhrases } from "@/lib/utils/privacy";
import { cn } from "@/lib/utils";

type PrivacyNoticeProps = {
  className?: string;
};

export function PrivacyNotice({ className }: PrivacyNoticeProps) {
  const p = privacyNoticePhrases;

  return (
    <aside className={cn(className)}>
      <Card>
        <CardContent className="flex gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Shield className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">{p.title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {p.leadBeforeAlias}
              <span className="font-medium text-foreground">{p.aliasWord}</span>
              {p.betweenAliasAvatar}
              <span className="font-medium text-foreground">{p.avatarWord}</span>
              {p.afterAvatar}
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
