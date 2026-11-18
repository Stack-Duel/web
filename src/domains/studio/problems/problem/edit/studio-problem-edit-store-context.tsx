"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";
import type { StudioProblemDetails } from "@/domains/studio/models/studio-problem-details";
import {
  createStudioProblemEditStore,
  type StudioProblemEditState,
} from "./studio-problem-edit-store";

const StudioProblemEditStoreContext =
  createContext<StoreApi<StudioProblemEditState> | null>(null);

type StudioProblemEditProviderProps = {
  details: StudioProblemDetails;
  children: ReactNode;
};

export function StudioProblemEditProvider({
  details,
  children,
}: Readonly<StudioProblemEditProviderProps>) {
  const [store] = useState(() => createStudioProblemEditStore(details));

  return (
    <StudioProblemEditStoreContext.Provider value={store}>
      {children}
    </StudioProblemEditStoreContext.Provider>
  );
}

export function useStudioProblemEditStore<TSelected>(
  selector: (state: StudioProblemEditState) => TSelected
): TSelected {
  const store = useContext(StudioProblemEditStoreContext);

  if (!store) {
    throw new Error(
      "useStudioProblemEditStore must be used within StudioProblemEditProvider"
    );
  }

  return useStore(store, selector);
}

export function useStudioProblemEditStoreApi() {
  const store = useContext(StudioProblemEditStoreContext);

  if (!store) {
    throw new Error(
      "useStudioProblemEditStoreApi must be used within StudioProblemEditProvider"
    );
  }

  return store;
}
