import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

type LimitBadgeProps = {
  current: number;
  max: number;
  label: string;
  className?: string;
};

export default function LimitBadge({
  current,
  max,
  label,
  className,
}: Readonly<LimitBadgeProps>) {
  const isAtLimit = max > 0 && current >= max;
  const isNearLimit = !isAtLimit && max > 0 && current >= max * 0.8;

  return (
    <Badge
      variant={isAtLimit ? "destructive" : "outline"}
      className={cn(
        isNearLimit &&
          "border-yellow-500 text-yellow-700 dark:text-yellow-400",
        className
      )}
    >
      {current}/{max} {label}
    </Badge>
  );
}
