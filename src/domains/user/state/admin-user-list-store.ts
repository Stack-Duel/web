import { create } from "zustand";

interface AdminUserListState {
  pageIndex: number;
  pageSize: number;
  timestamp: string;
  search: string;

  setPagination: (pageIndex: number, pageSize: number) => void;
  setSearch: (search: string) => void;
  resetSession: () => void;
}

const createTimestamp = () => new Date().toISOString();

export const useAdminUserListStore = create<AdminUserListState>((set) => ({
  pageIndex: 0,
  pageSize: 20,
  timestamp: createTimestamp(),
  search: "",

  setPagination: (pageIndex, pageSize) => set({ pageIndex, pageSize }),
  setSearch: (search) => set({ search, pageIndex: 0 }),
  resetSession: () => set({ pageIndex: 0, timestamp: createTimestamp() }),
}));
