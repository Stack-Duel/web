import { useState } from "react";
import type { RowSelectionState, Updater } from "@tanstack/react-table";

export type PoolAddSelection =
  | { mode: "explicit"; rowSelection: RowSelectionState }
  | { mode: "all-matching"; excludedIds: Set<string> };

function resolveUpdater<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(prev)
    : updater;
}

function rowSelectionForPage(
  selection: PoolAddSelection,
  pageIds: string[]
): RowSelectionState {
  if (selection.mode === "explicit") {
    return selection.rowSelection;
  }

  return Object.fromEntries(
    pageIds.map((id) => [id, !selection.excludedIds.has(id)])
  );
}

export function usePoolAddSelection() {
  const [selection, setSelection] = useState<PoolAddSelection>({
    mode: "explicit",
    rowSelection: {},
  });

  const handleRowSelectionChange = (
    pageIds: string[],
    updater: Updater<RowSelectionState>
  ) => {
    setSelection((prev) => {
      if (prev.mode === "explicit") {
        return {
          mode: "explicit",
          rowSelection: resolveUpdater(updater, prev.rowSelection),
        };
      }

      const before = rowSelectionForPage(prev, pageIds);
      const after = resolveUpdater(updater, before);
      const excludedIds = new Set(prev.excludedIds);
      for (const id of pageIds) {
        if (after[id]) {
          excludedIds.delete(id);
        } else {
          excludedIds.add(id);
        }
      }
      return { mode: "all-matching", excludedIds };
    });
  };

  const selectAllMatching = () =>
    setSelection({ mode: "all-matching", excludedIds: new Set() });

  const clear = () => setSelection({ mode: "explicit", rowSelection: {} });

  const isAllOnPageSelected = (pageIds: string[]) =>
    pageIds.length > 0 &&
    pageIds.every((id) => rowSelectionForPage(selection, pageIds)[id]);

  const selectedCount = (total: number) =>
    selection.mode === "explicit"
      ? Object.values(selection.rowSelection).filter(Boolean).length
      : total - selection.excludedIds.size;

  return {
    selection,
    rowSelection: (pageIds: string[]) =>
      rowSelectionForPage(selection, pageIds),
    onRowSelectionChange: handleRowSelectionChange,
    selectAllMatching,
    clear,
    isAllOnPageSelected,
    selectedCount,
  };
}
