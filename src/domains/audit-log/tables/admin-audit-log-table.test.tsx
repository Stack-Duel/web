import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminAuditLogTable from "./admin-audit-log-table";
import { http } from "@/shared/lib/http";
import { useAdminAuditLogStore } from "../state/admin-audit-log-store";
import { buildAuditLogEntry } from "@/test/factories/audit-log-entry";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(http, { deep: true });

function renderTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminAuditLogTable />, { wrapper: Wrapper });
}

describe("AdminAuditLogTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminAuditLogStore.setState({
      pageIndex: 0,
      pageSize: 20,
      timestamp: new Date().toISOString(),
    });
  });

  it("renders a row with the actor, action, and target for each entry", async () => {
    mockedHttp.get.mockResolvedValue({
      results: [
        buildAuditLogEntry({
          actorUsername: "adminuser",
          action: "user.groups.updated",
          targetType: "user",
          targetId: "user_1",
        }),
      ],
      total: 1,
      page: 1,
      size: 20,
      timestamp: "now",
    });

    renderTable();

    expect(await screen.findByText("adminuser")).toBeVisible();
    expect(screen.getByText("user.groups.updated")).toBeVisible();
    expect(screen.getByText("user:user_1")).toBeVisible();
  });

  it("shows a dash when an entry has no target", async () => {
    mockedHttp.get.mockResolvedValue({
      results: [
        buildAuditLogEntry({ targetType: undefined, targetId: undefined }),
      ],
      total: 1,
      page: 1,
      size: 20,
      timestamp: "now",
    });

    renderTable();

    expect(await screen.findAllByText("-")).not.toHaveLength(0);
  });

  it("shows an empty state when there are no audit log entries", async () => {
    mockedHttp.get.mockResolvedValue({
      results: [],
      total: 0,
      page: 1,
      size: 20,
      timestamp: "now",
    });

    renderTable();

    expect(await screen.findByText("No results.")).toBeVisible();
  });
});
