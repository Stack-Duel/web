import { create } from "zustand";

interface AdminSubmissionListState {
  pageIndex: number;
  pageSize: number;
  timestamp: string;
  searchId: string;

  setPagination: (pageIndex: number, pageSize: number) => void;
  setSearchId: (value: string) => void;
  resetSession: () => void;
}

const createTimestamp = () => new Date().toISOString();

export const useAdminSubmissionListStore = create<AdminSubmissionListState>(
  (set) => ({
    pageIndex: 0,
    pageSize: 20,
    timestamp: createTimestamp(),
    searchId: "",

    setPagination: (pageIndex, pageSize) => set({ pageIndex, pageSize }),
    setSearchId: (searchId) => set({ searchId, pageIndex: 0 }),
    resetSession: () => set({ pageIndex: 0, timestamp: createTimestamp() }),
  })
);
