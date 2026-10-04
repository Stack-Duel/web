import { create } from "zustand";
import type { GameStatus } from "../models/game";

interface AdminGameListState {
  pageIndex: number;
  pageSize: number;
  timestamp: string;
  statusFilter: GameStatus | "all";

  setPagination: (pageIndex: number, pageSize: number) => void;
  setStatusFilter: (value: GameStatus | "all") => void;
  resetSession: () => void;
}

const createTimestamp = () => new Date().toISOString();

export const useAdminGameListStore = create<AdminGameListState>((set) => ({
  pageIndex: 0,
  pageSize: 20,
  timestamp: createTimestamp(),
  statusFilter: "all",

  setPagination: (pageIndex, pageSize) => set({ pageIndex, pageSize }),
  setStatusFilter: (statusFilter) => set({ statusFilter, pageIndex: 0 }),
  resetSession: () => set({ pageIndex: 0, timestamp: createTimestamp() }),
}));
