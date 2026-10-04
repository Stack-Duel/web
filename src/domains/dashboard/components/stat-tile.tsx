import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type StatTileProps = {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  href?: string;
};

export function StatTile({
  label,
  value,
  icon: Icon,
  href,
}: Readonly<StatTileProps>) {
  const card = (
    <Card className={cn(href && "transition-colors hover:bg-muted/50")}>
      <CardContent className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          {value === undefined ? (
            <Skeleton className="h-6 w-12" />
          ) : (
            <span className="font-mono text-xl font-semibold tabular-nums">
              {value.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!href) {
    return card;
  }

  return (
    <Link href={href} className="block" aria-label={`View ${label}`}>
      {card}
    </Link>
  );
}
