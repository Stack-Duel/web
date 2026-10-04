import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminUsersTable from "./admin-users-table";
import { http } from "@/shared/lib/http";
import { useAdminUserListStore } from "../state/admin-user-list-store";
import { routerConfig } from "@/shared/router-config";
import { buildAdminUser } from "@/test/factories/user-admin-user";
import { buildGroup } from "@/test/factories/user-group";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockedHttp = vi.mocked(http, { deep: true });

function mockUsersPage(page: unknown) {
  mockedHttp.get.mockImplementation((url: string) =>
    url === "/api/v1/group"
      ? Promise.resolve([])
      : Promise.resolve(page as never)
  );
}

function renderTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminUsersTable />, { wrapper: Wrapper });
}

describe("AdminUsersTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminUserListStore.setState({
      pageIndex: 0,
      pageSize: 20,
      timestamp: new Date().toISOString(),
      search: "",
    });
  });

  it("renders a row with the username and group badges for each admin user", async () => {
    mockUsersPage({
      results: [
        buildAdminUser({
          username: "testuser",
          groups: [buildGroup({ name: "Admins" })],
        }),
      ],
      total: 1,
      page: 1,
      size: 20,
      timestamp: "now",
    });

    renderTable();

    expect(await screen.findByText("testuser")).toBeVisible();
    expect(screen.getByText("Admins")).toBeVisible();
  });

  it("falls back to the username's first letter when there is no avatar image", async () => {
    mockUsersPage({
      results: [
        buildAdminUser({
          username: "testuser",
          imageUrl: undefined,
          groups: [],
        }),
      ],
      total: 1,
      page: 1,
      size: 20,
      timestamp: "now",
    });

    renderTable();

    expect(await screen.findByText("T")).toBeVisible();
  });

  it("shows 'No groups' for a user with no group memberships", async () => {
    mockUsersPage({
      results: [buildAdminUser({ username: "testuser", groups: [] })],
      total: 1,
      page: 1,
      size: 20,
      timestamp: "now",
    });

    renderTable();

    expect(await screen.findByText("No groups")).toBeVisible();
  });

  it("shows an empty state when there are no admin users", async () => {
    mockUsersPage({
      results: [],
      total: 0,
      page: 1,
      size: 20,
      timestamp: "now",
    });

    renderTable();

    expect(await screen.findByText("No results.")).toBeVisible();
  });

  it("navigates to the user detail page when a row is clicked", async () => {
    const { routerMock } = await import("@/test/mocks/next-navigation");
    mockUsersPage({
      results: [buildAdminUser({ id: "user-1", username: "testuser" })],
      total: 1,
      page: 1,
      size: 20,
      timestamp: "now",
    });
    const user = userEvent.setup();

    renderTable();
    await user.click(await screen.findByText("testuser"));

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.adminUserDetail.execute({ id: "user-1" })
    );
  });

  it("debounces the search term before querying the API", async () => {
    vi.useFakeTimers();
    mockUsersPage({
      results: [],
      total: 0,
      page: 1,
      size: 20,
      timestamp: "now",
    });

    renderTable();
    await act(async () => {
      await Promise.resolve();
    });
    mockedHttp.get.mockClear();

    act(() => {
      useAdminUserListStore.getState().setSearch("alice");
    });

    expect(mockedHttp.get).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/user/admin",
      expect.objectContaining({
        params: expect.objectContaining({ search: "alice" }),
      })
    );

    vi.useRealTimers();
  });
});
