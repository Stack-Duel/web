import { Badge } from "@/shared/components/ui/badge";
import type { ProblemStatus } from "../models/admin-problem";

const statusConfig: Record<
  ProblemStatus,
  { variant: "secondary" | "outline" | "destructive"; className?: string }
> = {
  Draft: { variant: "secondary" },
  Published: {
    variant: "secondary",
    className: "bg-green-600 text-white hover:bg-green-600/90",
  },
  Archived: { variant: "outline" },
  Pending: {
    variant: "secondary",
    className: "bg-blue-600 text-white hover:bg-blue-600/90",
  },
  Failed: { variant: "destructive" },
};

type AdminProblemStatusBadgeProps = {
  status: ProblemStatus;
};

export default function AdminProblemStatusBadge({
  status,
}: Readonly<AdminProblemStatusBadgeProps>) {
  const { variant, className } = statusConfig[status];

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
