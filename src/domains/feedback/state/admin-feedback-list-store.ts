import { create } from "zustand";
import type { FeedbackStatus, FeedbackType } from "../models/feedback";

interface AdminFeedbackListState {
  pageIndex: number;
  pageSize: number;
  timestamp: string;
  typeFilter: FeedbackType | "all";
  statusFilter: FeedbackStatus | "all";

  setPagination: (pageIndex: number, pageSize: number) => void;
  setTypeFilter: (value: FeedbackType | "all") => void;
  setStatusFilter: (value: FeedbackStatus | "all") => void;
  resetSession: () => void;
}

const createTimestamp = () => new Date().toISOString();

export const useAdminFeedbackListStore = create<AdminFeedbackListState>(
  (set) => ({
    pageIndex: 0,
    pageSize: 20,
    timestamp: createTimestamp(),
    typeFilter: "all",
    statusFilter: "all",

    setPagination: (pageIndex, pageSize) => set({ pageIndex, pageSize }),
    setTypeFilter: (typeFilter) => set({ typeFilter, pageIndex: 0 }),
    setStatusFilter: (statusFilter) => set({ statusFilter, pageIndex: 0 }),
    resetSession: () => set({ pageIndex: 0, timestamp: createTimestamp() }),
  })
);
