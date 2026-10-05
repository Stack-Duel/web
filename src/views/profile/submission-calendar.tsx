"use client";

import { useMemo } from "react";
import { CalendarDays, Flame } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import type { SubmissionCalendarDay } from "@/domains/user/models/user-profile";

const DAYS_PER_WEEK = 7;
const CELL_SIZE_PX = 12;
const LEVEL_CLASSES = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
] as const;

function parseUtcDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`);
}

function formatTooltipDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    timeZone: "UTC",
    month: "short",
  });
}

function getLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

function getGridPosition(dayIndex: number, firstDayOfWeek: number) {
  const position = dayIndex + firstDayOfWeek;
  return {
    column: Math.floor(position / DAYS_PER_WEEK),
    row: position % DAYS_PER_WEEK,
  };
}

function getColumnCount(days: SubmissionCalendarDay[], firstDayOfWeek: number) {
  if (days.length === 0) return 0;
  return getGridPosition(days.length - 1, firstDayOfWeek).column + 1;
}

function getCurrentStreak(days: SubmissionCalendarDay[]) {
  let index = days.length - 1;
  if (index >= 0 && days[index].count === 0) index--;

  let streak = 0;
  for (; index >= 0; index--) {
    if (days[index].count === 0) break;
    streak++;
  }
  return streak;
}

function getLongestStreak(days: SubmissionCalendarDay[]) {
  let longest = 0;
  let running = 0;
  for (const day of days) {
    running = day.count > 0 ? running + 1 : 0;
    longest = Math.max(longest, running);
  }
  return longest;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

// The server only sends days with at least one submission (sparse) plus the
// full window's start/end — zero-count gaps are reconstructed here instead
// of being sent over the wire.
function buildContiguousDays(
  sparseDays: SubmissionCalendarDay[],
  rangeStart: string,
  rangeEnd: string
): SubmissionCalendarDay[] {
  const countsByDate = new Map(sparseDays.map((day) => [day.date, day.count]));
  const start = parseUtcDate(rangeStart).getTime();
  const end = parseUtcDate(rangeEnd).getTime();

  const days: SubmissionCalendarDay[] = [];
  for (let time = start; time <= end; time += MS_PER_DAY) {
    const date = toIsoDate(new Date(time));
    days.push({ date, count: countsByDate.get(date) ?? 0 });
  }
  return days;
}

const MIN_LABEL_COLUMN_GAP = 2;

function getMonthLabels(days: SubmissionCalendarDay[], firstDayOfWeek: number) {
  const labels: { column: number; label: string }[] = [];
  let previousMonth = -1;

  days.forEach((day, dayIndex) => {
    const date = parseUtcDate(day.date);
    const month = date.getUTCMonth();
    if (month !== previousMonth) {
      const { column } = getGridPosition(dayIndex, firstDayOfWeek);
      labels.push({ column, label: formatMonthLabel(date) });
      previousMonth = month;
    }
  });

  return labels.filter((label, index) => {
    const next = labels[index + 1];
    return !next || next.column - label.column >= MIN_LABEL_COLUMN_GAP;
  });
}

type SubmissionCalendarProps = {
  // Sparse: only days with at least one submission.
  days: SubmissionCalendarDay[];
  rangeStart: string;
  rangeEnd: string;
};

export default function SubmissionCalendar({
  days: sparseDays,
  rangeStart,
  rangeEnd,
}: Readonly<SubmissionCalendarProps>) {
  const days = useMemo(
    () => buildContiguousDays(sparseDays, rangeStart, rangeEnd),
    [sparseDays, rangeStart, rangeEnd]
  );

  const total = days.reduce((sum, day) => sum + day.count, 0);
  const max = days.reduce((m, day) => Math.max(m, day.count), 0);
  const firstDayOfWeek =
    days.length > 0 ? parseUtcDate(days[0].date).getUTCDay() : 0;
  const columnCount = getColumnCount(days, firstDayOfWeek);
  const monthLabels = getMonthLabels(days, firstDayOfWeek);
  const currentStreak = getCurrentStreak(days);
  const longestStreak = getLongestStreak(days);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            Submission activity
          </CardTitle>
          {total > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Flame
                className={cn("size-4", currentStreak > 0 && "text-primary")}
              />
              <span>
                {currentStreak} day{currentStreak === 1 ? "" : "s"} streak
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">
            No submission activity yet.
          </p>
        ) : (
          <TooltipProvider delayDuration={100}>
            <div className="overflow-x-auto pb-1">
              <div
                className="grid gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, ${CELL_SIZE_PX}px)`,
                  gridTemplateRows: `auto repeat(${DAYS_PER_WEEK}, ${CELL_SIZE_PX}px)`,
                }}
              >
                {monthLabels.map(({ column, label }) => (
                  <span
                    key={`${column}-${label}`}
                    className="text-xs text-muted-foreground"
                    style={{ gridColumn: column + 1, gridRow: 1 }}
                  >
                    {label}
                  </span>
                ))}
                {days.map((day, dayIndex) => {
                  const date = parseUtcDate(day.date);
                  const level = getLevel(day.count, max);
                  const { column, row } = getGridPosition(
                    dayIndex,
                    firstDayOfWeek
                  );

                  return (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "size-full rounded-xs",
                            LEVEL_CLASSES[level]
                          )}
                          style={{ gridColumn: column + 1, gridRow: row + 2 }}
                          aria-label={`${day.count} submission${day.count === 1 ? "" : "s"} on ${formatTooltipDate(date)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {`${day.count} submission${day.count === 1 ? "" : "s"} on ${formatTooltipDate(date)}`}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {total} submissions in the last 12 months · longest streak{" "}
                {longestStreak} day{longestStreak === 1 ? "" : "s"}
              </span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                {LEVEL_CLASSES.map((levelClass) => (
                  <div
                    key={levelClass}
                    className={cn("size-[11px] rounded-xs", levelClass)}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
