import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { ChevronRight, Clock, LucideIcon, Trophy, Users } from "lucide-react";
import { ComponentProps } from "react";

type PlayCardProps = {
  color: "lime" | "sky" | "fuchsia";
  icon: LucideIcon;
  header: string;
  tidbit: string;
  description: string;
  playerCount: string;
  time: string;
  onClick: () => void;
  type: string;
  disabled?: boolean;
  disabledText?: string;
} & ComponentProps<"div">;

export default function PlayCard({
  color,
  icon: Icon,
  header,
  tidbit,
  description,
  playerCount,
  time,
  onClick,
  type,
  disabled = false,
  disabledText = "Coming soon",
  className,
  ...props
}: Readonly<PlayCardProps>) {
  return (
    <Card
      aria-disabled={disabled}
      className={cn(
        disabled && "cursor-not-allowed opacity-60 grayscale-[0.4]",
        className
      )}
      {...props}
    >
      <CardHeader className="flex flex-row items-start justify-between">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            disabled ? "bg-muted" : `bg-${color}-500/15`
          )}
        >
          <Icon
            className={cn(
              "size-4",
              disabled ? "text-muted-foreground" : `text-${color}-500`
            )}
          />
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-xs font-medium",
            disabled
              ? "border-border bg-muted text-muted-foreground"
              : `border-${color}-500/30 bg-${color}-500/10 text-${color}-500`
          )}
        >
          {disabled ? disabledText : type}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-semibold">{header}</h3>
          <span
            className={cn(
              "text-sm font-medium",
              disabled ? "text-muted-foreground" : `text-${color}-500`
            )}
          >
            {tidbit}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" /> {playerCount}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" /> {time}
          </span>
        </div>
        <Button
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground"
        >
          <Trophy /> Play now <ChevronRight />
        </Button>
      </CardContent>
    </Card>
  );
}
