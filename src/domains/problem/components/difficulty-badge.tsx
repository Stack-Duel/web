import { Badge } from "@/shared/components/ui/badge";

const tiers = {
  beginner: {
    label: "Beginner",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  easy: {
    label: "Easy",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  intermediate: {
    label: "Intermediate",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  advanced: {
    label: "Advanced",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  expert: {
    label: "Expert",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

type DifficultyBadgeProps = {
  readonly difficulty: string;
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const tier = tiers[difficulty.toLowerCase() as keyof typeof tiers];

  if (!tier) {
    return null;
  }

  const { label, className } = tier;

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
}
