import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import UpdateDailyChallengeDialog from "./update-daily-challenge-dialog";
import { useAdminProblems } from "@/domains/problem/api/get-admin-problems";
import { useUpdateDailyChallenge } from "../api/update-daily-challenge";
import { buildAdminProblemListItem } from "@/test/factories/problem";

vi.mock("@/domains/problem/api/get-admin-problems");
vi.mock("../api/update-daily-challenge");
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockUseAdminProblems = vi.mocked(useAdminProblems);
const mockUseUpdateDailyChallenge = vi.mocked(useUpdateDailyChallenge);
const updateChallengeMock = vi.fn();

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(
    <UpdateDailyChallengeDialog
      date="2026-10-05"
      currentProblemTitle="Two Sum"
    />,
    { wrapper: Wrapper }
  );
}

describe("UpdateDailyChallengeDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUpdateDailyChallenge.mockReturnValue({
      mutateAsync: updateChallengeMock,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateDailyChallenge>);
    mockUseAdminProblems.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);
  });

  it("opens the dialog showing the currently assigned problem", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Change" }));

    const dialog = within(await screen.findByRole("dialog"));
    expect(
      dialog.getByText("Change daily challenge for 2026-10-05")
    ).toBeVisible();
    expect(dialog.getByText(/Currently assigned: Two Sum/)).toBeVisible();
  });

  it("lists matching problems from the search", async () => {
    const user = userEvent.setup();
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [
          buildAdminProblemListItem({ id: "p2", title: "Reverse String" }),
        ],
        total: 1,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);

    renderDialog();
    await user.click(screen.getByRole("button", { name: "Change" }));

    expect(await screen.findByText("Reverse String")).toBeVisible();
  });

  it("updates the challenge when a problem is selected", async () => {
    const user = userEvent.setup();
    updateChallengeMock.mockResolvedValue(undefined);
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [
          buildAdminProblemListItem({ id: "p2", title: "Reverse String" }),
        ],
        total: 1,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);

    renderDialog();
    await user.click(screen.getByRole("button", { name: "Change" }));
    await user.click(await screen.findByText("Reverse String"));

    await waitFor(() =>
      expect(updateChallengeMock).toHaveBeenCalledWith({
        date: "2026-10-05",
        problemId: "p2",
      })
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Set "Reverse String" as the daily challenge for 2026-10-05'
    );
  });

  it("shows an error toast when the update fails", async () => {
    const user = userEvent.setup();
    updateChallengeMock.mockRejectedValue(
      new Error("Only challenges scheduled after today can be updated.")
    );
    mockUseAdminProblems.mockReturnValue({
      data: {
        results: [
          buildAdminProblemListItem({ id: "p2", title: "Reverse String" }),
        ],
        total: 1,
        page: 1,
        size: 20,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminProblems>);

    renderDialog();
    await user.click(screen.getByRole("button", { name: "Change" }));
    await user.click(await screen.findByText("Reverse String"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Only challenges scheduled after today can be updated."
      )
    );
  });
});
