import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

type CountdownTimerProps = {
  /** When the timer started (e.g. game.startedAt) */
  startedAt: Date;
  /** Total duration of the timer, in seconds */
  timeLimitInSeconds: number;
  /** Called once, when the timer reaches 0. Must be a stable/memoized reference. */
  onComplete?: () => void;
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const LOW_TIME_THRESHOLD_SECONDS = 60;
const CRITICAL_TIME_THRESHOLD_SECONDS = 10;

function computeRemainingSeconds(
  startedAt: Date,
  timeLimitInSeconds: number
): number {
  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  const remaining = timeLimitInSeconds - Math.floor(elapsedMs / 1000);
  return Math.max(remaining, 0);
}

export default function CountdownTimer({
  startedAt,
  timeLimitInSeconds,
  onComplete,
}: Readonly<CountdownTimerProps>) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    computeRemainingSeconds(startedAt, timeLimitInSeconds)
  );

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onComplete?.();
      return;
    }

    const id = setTimeout(() => {
      setRemainingSeconds(
        computeRemainingSeconds(startedAt, timeLimitInSeconds)
      );
    }, 1000);

    return () => clearTimeout(id);
  }, [remainingSeconds, startedAt, timeLimitInSeconds, onComplete]);

  const isLowTime = remainingSeconds <= LOW_TIME_THRESHOLD_SECONDS;
  const isCriticalTime =
    remainingSeconds > 0 && remainingSeconds <= CRITICAL_TIME_THRESHOLD_SECONDS;

  return (
    <span
      aria-live="polite"
      aria-label={`Time left: ${formatDuration(remainingSeconds)}`}
      className={cn(
        "text-lg font-bold tabular-nums leading-none",
        isLowTime ? "text-destructive" : "text-foreground",
        isCriticalTime && "animate-timer-critical",
        isLowTime && !isCriticalTime && "animate-pulse"
      )}
    >
      {formatDuration(remainingSeconds)}
    </span>
  );
}
