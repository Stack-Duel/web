import { create } from "zustand";

interface AdminAuditLogState {
  pageIndex: number;
  pageSize: number;
  timestamp: string;

  setPagination: (pageIndex: number, pageSize: number) => void;
  resetSession: () => void;
}

const createTimestamp = () => new Date().toISOString();

export const useAdminAuditLogStore = create<AdminAuditLogState>((set) => ({
  pageIndex: 0,
  pageSize: 20,
  timestamp: createTimestamp(),

  setPagination: (pageIndex, pageSize) => set({ pageIndex, pageSize }),
  resetSession: () => set({ pageIndex: 0, timestamp: createTimestamp() }),
}));
