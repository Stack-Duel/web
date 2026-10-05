import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { ComponentProps } from "react";
import { ProblemSubmission } from "../models/problem-submission";
import { formatRelativeTime } from "@/shared/lib/date";
import CodeBlock from "@/shared/code-block/code-block";

type ProblemSubmissionsCardProps = {
  submission: ProblemSubmission;
} & ComponentProps<"div">;

const getStatusVariant = (status: ProblemSubmission["status"]) => {
  if (status === "WrongAnswer") {
    return "destructive" as const;
  }

  return "secondary" as const;
};

const getStatusClassName = (status: ProblemSubmission["status"]) => {
  if (status === "Accepted") {
    return "bg-green-600 text-white hover:bg-green-600/90";
  }

  return undefined;
};

const getStatusLabel = (status: ProblemSubmission["status"]) => {
  if (status === "WrongAnswer") {
    return "Wrong Answer";
  }

  return status;
};

export default function ProblemSubmissionsCard({
  submission,
  className,
  ...props
}: Readonly<ProblemSubmissionsCardProps>) {
  const {
    status,
    language,
    code,
    executionTime,
    memoryUsage,
    createdAt,
    user,
  } = submission;

  return (
    <Card className={cn("py-3", className)} {...props}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-muted-foreground">
            {user.username}
          </span>
          <Badge
            variant={getStatusVariant(status)}
            className={getStatusClassName(status)}
          >
            {getStatusLabel(status)}
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="shrink-0 text-xs text-muted-foreground ml-auto">
                {formatRelativeTime(createdAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {new Date(createdAt).toLocaleString()}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <CodeBlock code={code} language={language.name} />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-sm text-muted-foreground">
            {language.name}{" "}
            <span className="text-xs">({language.version})</span>
          </span>

          <div className="flex items-center gap-1.5 leading-tight">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Runtime
            </span>
            <span className="text-sm font-medium">
              {executionTime !== null ? `${executionTime} ms` : "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 leading-tight">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Memory
            </span>
            <span className="text-sm font-medium">
              {memoryUsage !== null ? `${memoryUsage} KB` : "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
