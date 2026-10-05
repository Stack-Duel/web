import { Check, Clock, Loader2, X } from "lucide-react";
import type { AdminSubmissionJobStepStatus } from "../models/admin-submission";

type StepStatusIconProps = {
  status: AdminSubmissionJobStepStatus;
};

export default function StepStatusIcon({
  status,
}: Readonly<StepStatusIconProps>) {
  switch (status) {
    case "Succeeded":
      return <Check size={16} className="text-green-600" />;
    case "Failed":
      return <X size={16} className="text-destructive" />;
    case "Running":
      return <Loader2 size={16} className="animate-spin text-blue-500" />;
    default:
      return <Clock size={16} className="text-muted-foreground" />;
  }
}
