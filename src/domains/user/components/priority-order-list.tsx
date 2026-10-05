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
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useId } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

type PriorityOrderListProps = {
  items: { id: string; name: string }[];
  orderedIds: string[];
  onOrderedIdsChange: (orderedIds: string[]) => void;
};

export default function PriorityOrderList({
  items,
  orderedIds,
  onOrderedIdsChange,
}: Readonly<PriorityOrderListProps>) {
  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemById = new Map(items.map((item) => [item.id, item]));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = orderedIds.indexOf(active.id as string);
      const newIndex = orderedIds.indexOf(over.id as string);
      onOrderedIdsChange(arrayMove(orderedIds, oldIndex, newIndex));
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        id={sortableId}
      >
        <Table>
          <TableBody>
            <SortableContext
              items={orderedIds}
              strategy={verticalListSortingStrategy}
            >
              {orderedIds.map((id, index) => {
                const item = itemById.get(id);
                if (!item) return null;
                return (
                  <OrderRow
                    key={id}
                    id={id}
                    rank={index + 1}
                    name={item.name}
                  />
                );
              })}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}

function OrderRow({
  id,
  rank,
  name,
}: Readonly<{ id: string; rank: number; name: string }>) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    setNodeRef,
    isDragging,
  } = useSortable({ id });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <TableCell className="w-10">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={cn(
            "flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted",
            "cursor-grab active:cursor-grabbing"
          )}
        >
          <GripVertical className="size-4" />
          <span className="sr-only">Drag to reorder</span>
        </button>
      </TableCell>
      <TableCell className="w-10 text-muted-foreground tabular-nums">
        {rank}
      </TableCell>
      <TableCell>{name}</TableCell>
    </TableRow>
  );
}
