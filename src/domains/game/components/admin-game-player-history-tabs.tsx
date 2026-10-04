"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, SkipForward, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { useAdminGamePlayerHistory } from "@/domains/game/api/get-admin-game-player-history";
import {
  AdminGameHistoryEvent,
  AdminGameHistoryEventType,
} from "@/domains/game/models/admin-game-history";
import type { GameParticipant } from "@/domains/game/models/game";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

type AdminGamePlayerHistoryTabsProps = {
  gameId: string;
  participants: GameParticipant[];
};

export default function AdminGamePlayerHistoryTabs({
  gameId,
  participants,
}: Readonly<AdminGamePlayerHistoryTabsProps>) {
  const { data, isLoading } = useAdminGamePlayerHistory({ gameId });

  const [order, setOrder] = useState<string[]>(() =>
    participants.map((p) => p.userId)
  );
  // Tabs for participants that show up after the initial render (shouldn't
  // normally happen for a single game snapshot, but keeps the list honest
  // rather than silently dropping a player) are appended at the end.
  const orderedIds = [
    ...order.filter((id) => participants.some((p) => p.userId === id)),
    ...participants.map((p) => p.userId).filter((id) => !order.includes(id)),
  ];

  const [activeTab, setActiveTab] = useState<string | undefined>(orderedIds[0]);

  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = orderedIds.indexOf(active.id as string);
      const newIndex = orderedIds.indexOf(over.id as string);
      setOrder(arrayMove(orderedIds, oldIndex, newIndex));
    }
  }

  if (participants.length === 0) {
    return (
      <p className="p-2 text-sm text-muted-foreground">No participants.</p>
    );
  }

  const participantById = new Map(participants.map((p) => [p.userId, p]));
  const historyByUser = new Map((data ?? []).map((h) => [h.userId, h]));

  return (
    <Tabs
      value={activeTab ?? orderedIds[0]}
      onValueChange={setActiveTab}
      className="gap-3"
    >
      <DndContext
        id={sortableId}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedIds}
          strategy={horizontalListSortingStrategy}
        >
          <TabsList
            variant="line"
            className="h-auto flex-wrap justify-start gap-1"
          >
            {orderedIds.map((userId) => {
              const participant = participantById.get(userId);
              if (!participant) return null;
              return (
                <PlayerTab
                  key={userId}
                  userId={userId}
                  participant={participant}
                />
              );
            })}
          </TabsList>
        </SortableContext>
      </DndContext>

      {orderedIds.map((userId) => {
        if (!participantById.has(userId)) return null;
        return (
          <TabsContent key={userId} value={userId}>
            <PlayerHistoryTimeline
              isLoading={isLoading}
              events={historyByUser.get(userId)?.events ?? []}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function PlayerTab({
  userId,
  participant,
}: Readonly<{ userId: string; participant: GameParticipant }>) {
  // Only the drag-activation listeners are spread here, not dnd-kit's
  // `attributes` — those default to role="button"/tabIndex, which would
  // stomp Radix's own role="tab" and roving-tabindex semantics.
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: userId });

  return (
    <TabsTrigger
      ref={setNodeRef}
      value={userId}
      data-dragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="relative z-0 flex-none cursor-grab gap-1.5 active:cursor-grabbing data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      {...listeners}
    >
      <Avatar size="sm">
        <AvatarImage src={participant.imageUrl} alt={participant.username} />
        <AvatarFallback>
          {participant.username?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <span className="max-w-32 truncate">{participant.username}</span>
    </TabsTrigger>
  );
}

const EVENT_META: Record<
  AdminGameHistoryEventType,
  { icon: LucideIcon; label: string; iconClassName: string }
> = {
  [AdminGameHistoryEventType.Accepted]: {
    icon: Check,
    label: "Solved",
    iconClassName: "text-green-600 dark:text-green-400",
  },
  [AdminGameHistoryEventType.WrongAnswer]: {
    icon: X,
    label: "Wrong answer",
    iconClassName: "text-destructive",
  },
  [AdminGameHistoryEventType.Skipped]: {
    icon: SkipForward,
    label: "Skipped",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
};

function PlayerHistoryTimeline({
  events,
  isLoading,
}: Readonly<{ events: AdminGameHistoryEvent[]; isLoading: boolean }>) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="p-2 text-sm text-muted-foreground">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-1.5">
      {events.map((event, index) => (
        <HistoryEventRow
          key={`${event.type}-${event.problemId}-${index}`}
          event={event}
        />
      ))}
    </ol>
  );
}

function HistoryEventRow({
  event,
}: Readonly<{ event: AdminGameHistoryEvent }>) {
  const meta = EVENT_META[event.type];
  const Icon = meta.icon;

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5 text-sm">
      <Icon size={14} className={cn("shrink-0", meta.iconClassName)} />
      {event.problemSlug ? (
        <Link
          href={`/problems/${event.problemSlug}`}
          className="min-w-0 flex-1 truncate font-medium hover:underline"
        >
          {event.problemTitle}
        </Link>
      ) : (
        <span className="min-w-0 flex-1 truncate font-medium">
          {event.problemTitle}
        </span>
      )}
      {event.languageName ? (
        <span className="text-xs text-muted-foreground">
          {event.languageName}
        </span>
      ) : null}
      <Badge
        variant={
          event.type === AdminGameHistoryEventType.WrongAnswer
            ? "destructive"
            : "secondary"
        }
      >
        {meta.label}
      </Badge>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {event.occurredAt
          ? new Date(event.occurredAt).toLocaleString()
          : "Time unknown"}
      </span>
      {event.submissionId ? (
        <Link
          href={`/admin/submissions/${event.submissionId}`}
          className="shrink-0 text-xs text-primary hover:underline"
        >
          View
        </Link>
      ) : null}
    </li>
  );
}
