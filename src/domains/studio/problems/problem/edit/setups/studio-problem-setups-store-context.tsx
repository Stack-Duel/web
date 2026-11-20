"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";
import {
  createStudioProblemSetupsStore,
  type StudioProblemSetupsState,
} from "./studio-problem-setups-store";

const StudioProblemSetupsStoreContext =
  createContext<StoreApi<StudioProblemSetupsState> | null>(null);

export function StudioProblemSetupsProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [store] = useState(() => createStudioProblemSetupsStore([]));

  return (
    <StudioProblemSetupsStoreContext.Provider value={store}>
      {children}
    </StudioProblemSetupsStoreContext.Provider>
  );
}

export function useStudioProblemSetupsStore<TSelected>(
  selector: (state: StudioProblemSetupsState) => TSelected
): TSelected {
  const store = useContext(StudioProblemSetupsStoreContext);

  if (!store) {
    throw new Error(
      "useStudioProblemSetupsStore must be used within StudioProblemSetupsProvider"
    );
  }

  return useStore(store, selector);
}

export function useStudioProblemSetupsStoreApi() {
  const store = useContext(StudioProblemSetupsStoreContext);

  if (!store) {
    throw new Error(
      "useStudioProblemSetupsStoreApi must be used within StudioProblemSetupsProvider"
    );
  }

  return store;
}
