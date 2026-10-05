import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminPoolMembersTable from "./admin-pool-members-table";
import { useProblemPoolMembers } from "../api/get-problem-pool-members";
import { useRemoveProblemFromPool } from "../api/remove-problem-from-pool";
import { buildAdminProblemListItem } from "@/test/factories/problem";

vi.mock("../api/get-problem-pool-members");
vi.mock("../api/remove-problem-from-pool");
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockUseProblemPoolMembers = vi.mocked(useProblemPoolMembers);
const mockUseRemoveProblemFromPool = vi.mocked(useRemoveProblemFromPool);
const removeFromPoolMock = vi.fn();

function renderTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminPoolMembersTable poolKey="daily" />, {
    wrapper: Wrapper,
  });
}

describe("AdminPoolMembersTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRemoveProblemFromPool.mockReturnValue({
      mutate: removeFromPoolMock,
      isPending: false,
    } as unknown as ReturnType<typeof useRemoveProblemFromPool>);
  });

  it("shows the current page of members", () => {
    mockUseProblemPoolMembers.mockReturnValue({
      data: {
        results: [buildAdminProblemListItem({ id: "p1", title: "Two Sum" })],
        total: 1,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPoolMembers>);

    renderTable();

    expect(screen.getByText("Two Sum")).toBeVisible();
  });

  it("removes a member when Remove is clicked", async () => {
    const user = userEvent.setup();
    mockUseProblemPoolMembers.mockReturnValue({
      data: {
        results: [buildAdminProblemListItem({ id: "p1", title: "Two Sum" })],
        total: 1,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPoolMembers>);

    renderTable();

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(removeFromPoolMock).toHaveBeenCalledWith(
      { poolKey: "daily", problemId: "p1" },
      expect.anything()
    );
  });

  it("shows an error toast when removing a member fails", async () => {
    const user = userEvent.setup();
    mockUseProblemPoolMembers.mockReturnValue({
      data: {
        results: [buildAdminProblemListItem({ id: "p1", title: "Two Sum" })],
        total: 1,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useProblemPoolMembers>);
    removeFromPoolMock.mockImplementation((_vars, { onError }) =>
      onError(new Error("Network error"))
    );

    renderTable();

    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Network error")
    );
  });
});
