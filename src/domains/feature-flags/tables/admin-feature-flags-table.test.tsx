import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminFeatureFlagsTable from "./admin-feature-flags-table";
import { http } from "@/shared/lib/http";
import { buildFeatureFlagAdmin } from "@/test/factories/feature-flag-admin";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("../components/manage-feature-flag-dialog", () => ({
  default: () => null,
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockedHttp = vi.mocked(http, { deep: true });

function renderTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminFeatureFlagsTable />, { wrapper: Wrapper });
}

describe("AdminFeatureFlagsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a row for each flag with key, name, and rollout percentage", async () => {
    mockedHttp.get.mockResolvedValue([
      buildFeatureFlagAdmin({
        key: "leaderboards",
        name: "Leaderboards",
        rolloutPercentage: 25,
      }),
    ]);

    renderTable();

    expect(await screen.findByText("leaderboards")).toBeVisible();
    expect(screen.getByText("Leaderboards")).toBeVisible();
    expect(screen.getByText("25%")).toBeVisible();
  });

  it("reflects the flag's default-enabled state in the checkbox", async () => {
    mockedHttp.get.mockResolvedValue([
      buildFeatureFlagAdmin({ key: "leaderboards", defaultEnabled: false }),
    ]);

    renderTable();

    const checkbox = await screen.findByRole("checkbox", {
      name: "Toggle default enabled for leaderboards",
    });
    expect(checkbox).not.toBeChecked();
  });

  it("toggling the default-enabled checkbox updates the flag", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      buildFeatureFlagAdmin({
        id: "flag_1",
        key: "leaderboards",
        defaultEnabled: true,
      }),
    ]);
    mockedHttp.put.mockResolvedValue(undefined);

    renderTable();

    const checkbox = await screen.findByRole("checkbox", {
      name: "Toggle default enabled for leaderboards",
    });
    await user.click(checkbox);

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/feature-flag/admin/flag_1/default",
        { defaultEnabled: false },
        expect.anything()
      )
    );
  });

  it("shows the overrides count badge when overrides exist", async () => {
    mockedHttp.get.mockResolvedValue([
      buildFeatureFlagAdmin({
        userOverrides: [{ userId: "user_1", effect: "Allow" }],
        groupOverrides: [{ groupId: "group_1", effect: "Deny" }],
      }),
    ]);

    renderTable();

    expect(await screen.findByText("2")).toBeVisible();
  });

  it("shows 'None' when a flag has no overrides", async () => {
    mockedHttp.get.mockResolvedValue([buildFeatureFlagAdmin()]);

    renderTable();

    expect(await screen.findByText("None")).toBeVisible();
  });
});
