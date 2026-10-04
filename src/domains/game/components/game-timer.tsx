import CountdownTimer from "@/shared/components/countdown-timer/countdown-timer";
import { Game, GameStatus } from "../models/game";

type GameTimerProps = {
  game: Game;
  onTimeExpired: () => void;
};

export default function GameTimer({
  game,
  onTimeExpired,
}: Readonly<GameTimerProps>) {
  if (game.status === GameStatus.Pending || !game.startedAt) {
    return <PendingTimer timeLimitInSeconds={game.timeLimitInSeconds} />;
  }

  if (
    game.status === GameStatus.Completed ||
    game.status === GameStatus.Cancelled
  ) {
    return null;
  }

  return (
    <CountdownTimer
      key={new Date(game.startedAt).getTime()}
      startedAt={game.startedAt}
      timeLimitInSeconds={game.timeLimitInSeconds}
      onComplete={onTimeExpired}
    />
  );
}

type PendingTimerProps = {
  timeLimitInSeconds: number;
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

function PendingTimer({ timeLimitInSeconds }: Readonly<PendingTimerProps>) {
  return (
    <div
      aria-live="polite"
      aria-label={`Not started. Time limit: ${formatDuration(timeLimitInSeconds)}`}
      className="flex flex-col items-center leading-none"
    >
      <span className="text-lg font-bold tabular-nums text-muted-foreground">
        {formatDuration(timeLimitInSeconds)}
      </span>
      <span className="mt-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        Not started
      </span>
    </div>
  );
}
