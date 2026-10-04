import { useDroppable } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { type EditorWindowTabNode } from "./state/editor-window-store";

type EditorWindowPanelHeaderProps = {
  tab: EditorWindowTabNode;
  currentTabIndex: number;
  setCurrentTab: (index: number) => void;
  /** When set, tabs in this header become draggable (reorder within the
   *  group, or move to/split against another group) and the header itself
   *  becomes a drop target. Omit to render a static, non-draggable header. */
  groupId?: string;
};

type EditorWindowTabButtonProps = {
  tabKey: string;
  active: boolean;
  icon?: ReactNode;
  name?: ReactNode;
  onClick: () => void;
  draggable: boolean;
  onClose?: () => void;
};

const EditorWindowTabButton = ({
  tabKey,
  active,
  icon,
  name,
  onClick,
  draggable,
  onClose,
}: EditorWindowTabButtonProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: `tab:${tabKey}`,
    disabled: !draggable,
    animateLayoutChanges: () => false,
  });

  const dragProps = draggable ? { ...attributes, ...listeners } : undefined;
  const stateClass = cn(
    active ? "text-foreground" : "text-muted-foreground",
    isDragging && "opacity-50"
  );
  const content = (
    <>
      {icon && <span className="mr-1">{icon}</span>}
      {name}
    </>
  );

  if (!onClose) {
    return (
      <Button
        ref={setNodeRef}
        variant={active ? "secondary" : "ghost"}
        className={cn("h-7 px-3 py-1", stateClass)}
        onClick={onClick}
        {...dragProps}
      >
        {content}
      </Button>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        buttonVariants({ variant: active ? "secondary" : "ghost" }),
        "h-7 gap-0.5 px-1.5 py-1",
        stateClass
      )}
      {...dragProps}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex items-center px-1"
      >
        {content}
      </button>
      <button
        type="button"
        aria-label={`Close ${typeof name === "string" ? name : "tab"}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="rounded-sm p-0.5 hover:bg-foreground/10 hover:text-foreground"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export const EditorWindowPanelHeader = ({
  tab,
  currentTabIndex,
  setCurrentTab,
  groupId,
}: EditorWindowPanelHeaderProps) => {
  const { setNodeRef: setGroupDropRef, isOver: isGroupOver } = useDroppable({
    id: `group:${groupId ?? "disabled"}`,
    disabled: !groupId,
  });

  if (tab.children) {
    const sortableIds = tab.children.map((t, index) => `tab:${t.key ?? index}`);

    return (
      <nav
        ref={groupId ? setGroupDropRef : undefined}
        className={cn(
          "flex shrink-0 items-center gap-1 overflow-x-auto overflow-y-visible border-b px-2 py-1",
          isGroupOver && "bg-primary/10"
        )}
      >
        <SortableContext
          items={sortableIds}
          strategy={horizontalListSortingStrategy}
        >
          {tab.children.map((t, index) => (
            <EditorWindowTabButton
              key={t.key ?? index}
              tabKey={t.key ?? String(index)}
              active={index === currentTabIndex}
              icon={t.icon}
              name={t.name}
              onClick={() => setCurrentTab(index)}
              draggable={Boolean(groupId)}
              onClose={t.onClose}
            />
          ))}
        </SortableContext>
      </nav>
    );
  }
  return (
    <nav
      ref={groupId ? setGroupDropRef : undefined}
      className={cn(
        "flex shrink-0 items-center gap-5 border-b px-2 py-1",
        isGroupOver && "bg-primary/10"
      )}
    >
      <EditorWindowTabButton
        tabKey={tab.key ?? "solo"}
        active={false}
        icon={tab.icon}
        name={tab.name}
        onClick={() => {}}
        draggable={Boolean(groupId)}
        onClose={tab.onClose}
      />
      {tab?.headerComponent}
    </nav>
  );
};
