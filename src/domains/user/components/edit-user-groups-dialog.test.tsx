import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import EditUserGroupsDialog from "./edit-user-groups-dialog";
import { http } from "@/shared/lib/http";
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
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockedHttp = vi.mocked(http, { deep: true });

function renderDialog(user = buildAdminUser({ groups: [buildGroup()] })) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<EditUserGroupsDialog user={user} />, { wrapper: Wrapper });
}

describe("EditUserGroupsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preselects the user's current groups when opened", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      buildGroup({ id: "group_1", name: "Admins" }),
      buildGroup({ id: "group_2", name: "Moderators" }),
    ]);
    renderDialog(
      buildAdminUser({
        groups: [buildGroup({ id: "group_1", name: "Admins" })],
      })
    );

    await user.click(screen.getByRole("button", { name: "Edit groups" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Admins")).toBeChecked();
    });
    expect(screen.getByLabelText("Moderators")).not.toBeChecked();
  });

  it("shows a message when there are no groups available", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([]);
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Edit groups" }));

    expect(await screen.findByText("No groups available.")).toBeVisible();
  });

  it("saves the selected groups and shows a success toast", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      buildGroup({ id: "group_1", name: "Admins" }),
    ]);
    mockedHttp.put.mockResolvedValue(undefined);
    renderDialog(buildAdminUser({ username: "testuser", groups: [] }));

    await user.click(screen.getByRole("button", { name: "Edit groups" }));
    await screen.findByLabelText("Admins");
    await user.click(screen.getByLabelText("Admins"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockedHttp.put).toHaveBeenCalledWith(
        expect.stringContaining("/groups"),
        { groupIds: ["group_1"] },
        expect.anything()
      );
    });
    expect(toast.success).toHaveBeenCalledWith("Updated groups for testuser");
    expect(
      screen.queryByRole("heading", { name: /Edit groups for/ })
    ).not.toBeInTheDocument();
  });

  it("shows an error toast when saving fails", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      buildGroup({ id: "group_1", name: "Admins" }),
    ]);
    mockedHttp.put.mockRejectedValue(new Error("Network error"));
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Edit groups" }));
    await screen.findByLabelText("Admins");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });
});
