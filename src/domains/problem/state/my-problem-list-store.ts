import { create } from "zustand";
import type { ProblemStatus } from "../models/admin-problem";

interface MyProblemListState {
  pageIndex: number;
  pageSize: number;
  timestamp: string;
  search: string;
  statusFilter: ProblemStatus[];

  setPagination: (pageIndex: number, pageSize: number) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (statusFilter: ProblemStatus[]) => void;
  toggleStatusFilter: (status: ProblemStatus) => void;
  resetSession: () => void;
}

const createTimestamp = () => new Date().toISOString();

export const useMyProblemListStore = create<MyProblemListState>((set) => ({
  pageIndex: 0,
  pageSize: 20,
  timestamp: createTimestamp(),
  search: "",
  statusFilter: [],

  setPagination: (pageIndex, pageSize) => set({ pageIndex, pageSize }),
  setSearch: (search) => set({ search, pageIndex: 0 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, pageIndex: 0 }),
  toggleStatusFilter: (status) =>
    set((state) => ({
      statusFilter: state.statusFilter.includes(status)
        ? state.statusFilter.filter((s) => s !== status)
        : [...state.statusFilter, status],
      pageIndex: 0,
    })),
  resetSession: () => set({ pageIndex: 0, timestamp: createTimestamp() }),
}));
