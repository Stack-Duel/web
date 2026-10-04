import { Badge } from "@/shared/components/ui/badge";
import { Crown, Trophy } from "lucide-react";

type ScoreBadgeProps = {
  score: number;
  /** Shows a crown instead of the trophy icon when this player currently holds first place. */
  leading?: boolean;
};

export default function ScoreBadge({
  score,
  leading = false,
}: Readonly<ScoreBadgeProps>) {
  return (
    <Badge variant="secondary" className="h-7 gap-1.5 px-2.5 text-sm">
      {leading ? (
        <Crown
          aria-hidden="true"
          data-icon="inline-start"
          className="size-3.5 text-amber-600 dark:text-amber-400"
        />
      ) : (
        <Trophy
          aria-hidden="true"
          data-icon="inline-start"
          className="size-3.5"
        />
      )}
      Score: {score}
    </Badge>
  );
}
