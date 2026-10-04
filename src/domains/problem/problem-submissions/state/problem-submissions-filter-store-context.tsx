"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";
import {
  createProblemSubmissionsFilterStore,
  type ProblemSubmissionsFilterState,
} from "./problem-submissions-filter-store";

const ProblemSubmissionsFilterStoreContext =
  createContext<StoreApi<ProblemSubmissionsFilterState> | null>(null);

export function ProblemSubmissionsFilterProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // One store per mount of the submissions page: fresh filter/sort state
  // each time you navigate here, same as `problem-list-store`.
  const [store] = useState(createProblemSubmissionsFilterStore);
  return (
    <ProblemSubmissionsFilterStoreContext.Provider value={store}>
      {children}
    </ProblemSubmissionsFilterStoreContext.Provider>
  );
}

export function useProblemSubmissionsFilterStore<T>(
  selector: (state: ProblemSubmissionsFilterState) => T
): T {
  const store = useContext(ProblemSubmissionsFilterStoreContext);
  if (!store) {
    throw new Error(
      "useProblemSubmissionsFilterStore must be used within ProblemSubmissionsFilterProvider"
    );
  }
  return useStore(store, selector);
}
