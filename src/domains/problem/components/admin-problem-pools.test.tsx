import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminProblemPools from "./admin-problem-pools";
import { http } from "@/shared/lib/http";
import { buildProblemPool } from "@/test/factories/problem";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockedHttp = vi.mocked(http, { deep: true });

function renderPools(poolKeys: string[] = []) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(
    <AdminProblemPools problemId="problem_1" poolKeys={poolKeys} />,
    { wrapper: Wrapper }
  );
}

describe("AdminProblemPools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks the pools the problem already belongs to", async () => {
    mockedHttp.get.mockResolvedValue([
      buildProblemPool({ id: "pool_1", key: "daily", name: "Daily" }),
      buildProblemPool({ id: "pool_2", key: "weekly", name: "Weekly" }),
    ]);
    renderPools(["weekly"]);

    await waitFor(() => {
      expect(screen.getByLabelText("Weekly")).toBeChecked();
    });
    expect(screen.getByLabelText("Daily")).not.toBeChecked();
  });

  it("shows a message when there are no pools yet", async () => {
    mockedHttp.get.mockResolvedValue([]);
    renderPools();

    expect(
      await screen.findByText("No problem pools exist yet. Create one below.")
    ).toBeVisible();
  });

  it("adds the problem to a pool when checked", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      buildProblemPool({ id: "pool_1", key: "daily", name: "Daily" }),
    ]);
    mockedHttp.put.mockResolvedValue(undefined);
    renderPools();

    await user.click(await screen.findByLabelText("Daily"));

    await waitFor(() => {
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/problempool/daily/problems/problem_1",
        undefined,
        expect.anything()
      );
    });
  });

  it("removes the problem from a pool when unchecked", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      buildProblemPool({ id: "pool_1", key: "daily", name: "Daily" }),
    ]);
    mockedHttp.delete.mockResolvedValue(undefined);
    renderPools(["daily"]);

    await user.click(await screen.findByLabelText("Daily"));

    await waitFor(() => {
      expect(mockedHttp.delete).toHaveBeenCalledWith(
        "/api/v1/problempool/daily/problems/problem_1",
        expect.anything()
      );
    });
  });

  it("shows an error toast when toggling a pool fails", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      buildProblemPool({ id: "pool_1", key: "daily", name: "Daily" }),
    ]);
    mockedHttp.put.mockRejectedValue(new Error("Network error"));
    renderPools();

    await user.click(await screen.findByLabelText("Daily"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });

  it("creates a new pool from the inline form", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([]);
    mockedHttp.post.mockResolvedValue("pool_1");
    renderPools();

    await screen.findByText("No problem pools exist yet. Create one below.");
    await user.type(screen.getByLabelText("Key"), "daily");
    await user.type(screen.getByLabelText("Name"), "Daily challenge");
    await user.click(screen.getByRole("button", { name: "New pool" }));

    await waitFor(() => {
      expect(mockedHttp.post).toHaveBeenCalledWith(
        "/api/v1/problempool",
        { key: "daily", name: "Daily challenge", description: undefined },
        expect.anything()
      );
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Pool "Daily challenge" created'
    );
  });
});
