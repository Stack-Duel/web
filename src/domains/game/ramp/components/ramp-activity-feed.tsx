"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
} from "@/shared/components/ui/bubble";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { formatRelativeTime } from "@/shared/lib/date";
import type { SubmissionStatus } from "@/domains/submission/models/submission-status";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import {
  useGameSessionStore,
  selectFeed,
  type GameFeedEntry,
} from "../../state/game-session-store";
import type { Game, GameParticipant } from "../../models/game";
import RampQuickReactions from "./ramp-quick-reactions";

type RampActivityFeedProps = {
  game: Game;
};

const statusIcons: Record<SubmissionStatus, React.ReactNode> = {
  Accepted: <CheckCircle2 size={14} />,
  Queued: <XCircle size={14} />,
  Running: <XCircle size={14} />,
  WrongAnswer: <XCircle size={14} />,
};

const getStatusIcon = (status: SubmissionStatus) =>
  statusIcons[status] ?? <XCircle />;

const getStatusLabel = (status: SubmissionStatus) =>
  status === "WrongAnswer" ? "Wrong Answer" : status;

/**
 * Renders one feed entry's content. A switch on `entry.type` is the only place a future entry
 * kind (e.g. a real chat message) needs a new case. TS flags the switch as non-exhaustive the
 * moment the union grows, so there's no way to add a type and forget to render it.
 */
function FeedEntryContent({ entry }: Readonly<{ entry: GameFeedEntry }>) {
  switch (entry.type) {
    case "attempt":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium w-27",
            entry.status === "WrongAnswer" && "w-38 whitespace-nowrap"
          )}
        >
          <span className="shrink-0">{getStatusIcon(entry.status)}</span>
          <span>{getStatusLabel(entry.status)}</span>
        </span>
      );
    case "reaction":
      return (
        <span aria-hidden="true" className="text-2xl leading-none">
          {entry.emoji}
        </span>
      );
  }
}

function FeedEntryBubble({
  entry,
  participant,
  isSelf,
}: Readonly<{
  entry: GameFeedEntry;
  participant: GameParticipant | undefined;
  isSelf: boolean;
}>) {
  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isSelf ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar size="sm" className="shrink-0">
        <AvatarImage src={participant?.imageUrl} alt={participant?.username} />
        <AvatarFallback>
          {participant?.username?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <BubbleGroup className={cn(isSelf && "items-end")}>
        <span className="px-1 text-xs font-medium text-muted-foreground">
          {participant?.username ?? "Unknown player"}
        </span>
        <Bubble
          align={isSelf ? "end" : "start"}
          variant={isSelf ? "secondary" : "muted"}
        >
          <BubbleContent>
            <FeedEntryContent entry={entry} />
          </BubbleContent>
        </Bubble>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="px-1 text-[10px] text-muted-foreground">
              {formatRelativeTime(entry.createdAt)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {new Date(entry.createdAt).toLocaleString()}
          </TooltipContent>
        </Tooltip>
      </BubbleGroup>
    </div>
  );
}

/**
 * Always-visible chat-style panel for a Running game: a live feed of submission attempts and
 * quick emoji reactions (verdict/emoji, who, and when, deliberately not which problem, since
 * participants can be on different ones and naming it could spoil pool content the viewer hasn't
 * reached yet), plus the reaction picker to send one. Purely a moment-to-moment view built from
 * SignalR pushes; a page refresh clears it, unlike the durable per-player History tab.
 */
export default function RampActivityFeed({
  game,
}: Readonly<RampActivityFeedProps>) {
  const feed = useGameSessionStore(selectFeed);
  const user = useUserStore(selectUser);

  return (
    <div className="absolute inset-0 flex flex-col">
      {feed.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
          No activity yet.
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 flex-col-reverse gap-3 overflow-y-auto p-3">
          {feed.map((entry) => (
            <FeedEntryBubble
              key={entry.id}
              entry={entry}
              participant={game.participants.find(
                (p) => p.userId === entry.userId
              )}
              isSelf={entry.userId === user?.id}
            />
          ))}
        </div>
      )}
      <RampQuickReactions gameId={game.gameId} />
    </div>
  );
}
