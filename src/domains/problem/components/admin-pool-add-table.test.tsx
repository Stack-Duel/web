import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminPoolAddTable from "./admin-pool-add-table";
import { useAdminProblems } from "../api/get-admin-problems";
import { useAddProblemsToPool } from "../api/add-problems-to-pool";
import { buildAdminProblemListItem } from "@/test/factories/problem";

vi.mock("../api/get-admin-problems");
vi.mock("../api/add-problems-to-pool");
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockUseAdminProblems = vi.mocked(useAdminProblems);
const mockUseAddProblemsToPool = vi.mocked(useAddProblemsToPool);
const addProblemsMock = vi.fn();

function renderTable(memberIds: Set<string> = new Set(), onAdded?: () => void) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(
    <AdminPoolAddTable
      poolKey="daily"
      memberIds={memberIds}
      onAdded={onAdded}
    />,
    { wrapper: Wrapper }
  );
}

describe("AdminPoolAddTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAddProblemsToPool.mockReturnValue({
      mutateAsync: addProblemsMock,
      isPending: false,
    } as unknown as ReturnType<typeof useAddProblemsToPool>);
  });

  it("excludes problems already in the pool", () => {
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [
          buildAdminProblemListItem({ id: "p1", title: "Two Sum" }),
          buildAdminProblemListItem({ id: "p2", title: "Reverse String" }),
        ],
        total: 2,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);

    renderTable(new Set(["p1"]));

    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
    expect(screen.getByText("Reverse String")).toBeVisible();
  });

  it("saves explicitly checked rows", async () => {
    const user = userEvent.setup();
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [
          buildAdminProblemListItem({ id: "p1", title: "Two Sum" }),
          buildAdminProblemListItem({ id: "p2", title: "Reverse String" }),
        ],
        total: 2,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);
    addProblemsMock.mockResolvedValue(1);

    renderTable();

    await user.click(screen.getByRole("checkbox", { name: "Select Two Sum" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(addProblemsMock).toHaveBeenCalledWith({
        poolKey: "daily",
        problemIds: ["p1"],
        selectAllMatching: false,
        excludedProblemIds: [],
      })
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Added 1 problem(s) to the pool"
    );
  });

  it("selects every matching problem, not just the loaded page, in one click", async () => {
    const user = userEvent.setup();
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [buildAdminProblemListItem({ id: "p1", title: "Two Sum" })],
        total: 50,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);

    renderTable();

    await user.click(
      screen.getByRole("checkbox", { name: "Select all matching problems" })
    );

    expect(screen.getByText("50 selected")).toBeVisible();
  });

  it("saves select-all-matching minus excluded ids", async () => {
    const user = userEvent.setup();
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [
          buildAdminProblemListItem({ id: "p1", title: "Two Sum" }),
          buildAdminProblemListItem({ id: "p2", title: "Reverse String" }),
        ],
        total: 3,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);
    addProblemsMock.mockResolvedValue(1);

    renderTable();

    await user.click(
      screen.getByRole("checkbox", { name: "Select all matching problems" })
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Select Reverse String" })
    );
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(addProblemsMock).toHaveBeenCalledWith({
        poolKey: "daily",
        problemIds: [],
        selectAllMatching: true,
        search: undefined,
        excludedProblemIds: ["p2"],
      })
    );
  });

  it("shows a later page's rows as checked after select-all, without re-clicking", async () => {
    const user = userEvent.setup();
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [
          buildAdminProblemListItem({ id: "p1", title: "Page One Item" }),
        ],
        total: 2,
        page: 1,
        size: 1,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);

    const { rerender } = renderTable();

    await user.click(
      screen.getByRole("checkbox", { name: "Select all matching problems" })
    );

    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [
          buildAdminProblemListItem({ id: "p2", title: "Page Two Item" }),
        ],
        total: 2,
        page: 2,
        size: 1,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);
    rerender(<AdminPoolAddTable poolKey="daily" memberIds={new Set()} />);

    expect(
      screen.getByRole("checkbox", { name: "Select Page Two Item" })
    ).toHaveAttribute("aria-checked", "true");
  });

  it("calls onAdded after a successful save that added at least one problem", async () => {
    const user = userEvent.setup();
    const onAdded = vi.fn();
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [buildAdminProblemListItem({ id: "p1", title: "Two Sum" })],
        total: 1,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);
    addProblemsMock.mockResolvedValue(1);

    renderTable(new Set(), onAdded);

    await user.click(screen.getByRole("checkbox", { name: "Select Two Sum" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onAdded).toHaveBeenCalledOnce());
  });

  it("does not call onAdded when nothing new was added", async () => {
    const user = userEvent.setup();
    const onAdded = vi.fn();
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [buildAdminProblemListItem({ id: "p1", title: "Two Sum" })],
        total: 1,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);
    addProblemsMock.mockResolvedValue(0);

    renderTable(new Set(), onAdded);

    await user.click(screen.getByRole("checkbox", { name: "Select Two Sum" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Added 0 problem(s) to the pool"
      )
    );
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("shows an error toast when saving fails", async () => {
    const user = userEvent.setup();
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [buildAdminProblemListItem({ id: "p1", title: "Two Sum" })],
        total: 1,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);
    addProblemsMock.mockRejectedValue(new Error("Network error"));

    renderTable();

    await user.click(screen.getByRole("checkbox", { name: "Select Two Sum" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Network error")
    );
  });
});
