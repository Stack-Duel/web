import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import ManageFeatureFlagDialog from "./manage-feature-flag-dialog";
import { http } from "@/shared/lib/http";
import { buildFeatureFlagAdmin } from "@/test/factories/feature-flag-admin";
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
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockedHttp = vi.mocked(http, { deep: true });

function renderDialog(flag = buildFeatureFlagAdmin()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<ManageFeatureFlagDialog flag={flag} />, { wrapper: Wrapper });
}

describe("ManageFeatureFlagDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedHttp.get.mockResolvedValue([]);
  });

  it("shows the flag's name and description as read-only text", async () => {
    const user = userEvent.setup();
    renderDialog(
      buildFeatureFlagAdmin({
        key: "leaderboards",
        name: "Leaderboards",
        description: "Kill switch.",
      })
    );

    await user.click(screen.getByRole("button", { name: "Manage" }));

    expect(screen.getByText(/Leaderboards: Kill switch\./)).toBeVisible();
    expect(
      screen.queryByRole("textbox", { name: "Name" })
    ).not.toBeInTheDocument();
  });

  it("renders existing user overrides with their effect", async () => {
    const user = userEvent.setup();
    renderDialog(
      buildFeatureFlagAdmin({
        userOverrides: [{ userId: "user_1", effect: "Deny" }],
      })
    );

    await user.click(screen.getByRole("button", { name: "Manage" }));

    expect(screen.getByText("user_1")).toBeVisible();
    expect(screen.getByText("Deny")).toBeVisible();
  });

  it("resolves group overrides to the group's name via useGroups", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      buildGroup({ id: "group_1", name: "Admins" }),
    ]);
    renderDialog(
      buildFeatureFlagAdmin({
        groupOverrides: [{ groupId: "group_1", effect: "Allow" }],
      })
    );

    await user.click(screen.getByRole("button", { name: "Manage" }));

    expect(await screen.findByText("Admins")).toBeVisible();
  });

  it("updates the rollout percentage", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockResolvedValue(undefined);
    renderDialog(buildFeatureFlagAdmin({ id: "flag_1", rolloutPercentage: 0 }));

    await user.click(screen.getByRole("button", { name: "Manage" }));
    const input = screen.getByLabelText("Rollout percentage");
    await user.clear(input);
    await user.type(input, "25");
    await user.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/feature-flag/admin/flag_1/rollout",
        { rolloutPercentage: 25 },
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Updated rollout percentage");
  });

  it("rejects an out-of-range rollout percentage without calling the API", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Manage" }));
    const input = screen.getByLabelText("Rollout percentage");
    await user.clear(input);
    await user.type(input, "150");
    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(toast.error).toHaveBeenCalledWith(
      "Rollout percentage must be between 0 and 100."
    );
    expect(mockedHttp.put).not.toHaveBeenCalled();
  });

  it("adds a user override and clears the input on success", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockResolvedValue(undefined);
    renderDialog(buildFeatureFlagAdmin({ id: "flag_1" }));

    await user.click(screen.getByRole("button", { name: "Manage" }));
    await user.type(screen.getByPlaceholderText("User id (GUID)"), "user_1");
    await user.click(screen.getByRole("button", { name: "Add user override" }));

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/feature-flag/admin/flag_1/user-overrides/user_1",
        { effect: "Allow" },
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Added user override");
    expect(screen.getByPlaceholderText("User id (GUID)")).toHaveValue("");
  });

  it("removes a user override", async () => {
    const user = userEvent.setup();
    mockedHttp.delete.mockResolvedValue(undefined);
    renderDialog(
      buildFeatureFlagAdmin({
        id: "flag_1",
        userOverrides: [{ userId: "user_1", effect: "Allow" }],
      })
    );

    await user.click(screen.getByRole("button", { name: "Manage" }));
    await user.click(
      screen.getByRole("button", { name: "Remove user override for user_1" })
    );

    await waitFor(() =>
      expect(mockedHttp.delete).toHaveBeenCalledWith(
        "/api/v1/feature-flag/admin/flag_1/user-overrides/user_1",
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Removed user override");
  });

  it("removes a group override", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      buildGroup({ id: "group_1", name: "Admins" }),
    ]);
    mockedHttp.delete.mockResolvedValue(undefined);
    renderDialog(
      buildFeatureFlagAdmin({
        id: "flag_1",
        groupOverrides: [{ groupId: "group_1", effect: "Allow" }],
      })
    );

    await user.click(screen.getByRole("button", { name: "Manage" }));
    await screen.findByText("Admins");
    await user.click(
      screen.getByRole("button", { name: "Remove group override for Admins" })
    );

    await waitFor(() =>
      expect(mockedHttp.delete).toHaveBeenCalledWith(
        "/api/v1/feature-flag/admin/flag_1/group-overrides/group_1",
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Removed group override");
  });
});
