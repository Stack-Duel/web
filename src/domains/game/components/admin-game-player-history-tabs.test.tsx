import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminGamePlayerHistoryTabs from "./admin-game-player-history-tabs";
import { useAdminGamePlayerHistory } from "@/domains/game/api/get-admin-game-player-history";
import { AdminGameHistoryEventType } from "@/domains/game/models/admin-game-history";
import type { GameParticipant } from "@/domains/game/models/game";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/game/api/get-admin-game-player-history");

const mockUseAdminGamePlayerHistory = vi.mocked(useAdminGamePlayerHistory);

function buildParticipant(
  overrides: Partial<GameParticipant> = {}
): GameParticipant {
  return {
    userId: "u1",
    username: "alice",
    seatNumber: 1,
    joinedAt: new Date(),
    score: 3,
    hasForfeited: false,
    hasFinishedProblems: false,
    ...overrides,
  };
}

describe("AdminGamePlayerHistoryTabs", () => {
  it("shows a message when there are no participants", () => {
    mockUseAdminGamePlayerHistory.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminGamePlayerHistory>);

    render(<AdminGamePlayerHistoryTabs gameId="game_1" participants={[]} />);

    expect(screen.getByText("No participants.")).toBeVisible();
  });

  it("shows loading skeletons while history is loading", () => {
    mockUseAdminGamePlayerHistory.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useAdminGamePlayerHistory>);

    const { container } = render(
      <AdminGamePlayerHistoryTabs
        gameId="game_1"
        participants={[buildParticipant()]}
      />
    );

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(
      3
    );
  });

  it("shows a message when the active player has no recorded events", () => {
    mockUseAdminGamePlayerHistory.mockReturnValue({
      data: [{ userId: "u1", events: [] }],
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminGamePlayerHistory>);

    render(
      <AdminGamePlayerHistoryTabs
        gameId="game_1"
        participants={[buildParticipant()]}
      />
    );

    expect(screen.getByText("No activity recorded yet.")).toBeVisible();
  });

  it("renders solved, wrong-answer, and skipped events for the active player", () => {
    mockUseAdminGamePlayerHistory.mockReturnValue({
      data: [
        {
          userId: "u1",
          events: [
            {
              type: AdminGameHistoryEventType.WrongAnswer,
              problemId: "p1",
              problemTitle: "Two Sum",
              problemSlug: "two-sum",
              occurredAt: "2026-01-01T00:00:00.000Z",
              submissionId: "sub_1",
              languageName: "Python",
            },
            {
              type: AdminGameHistoryEventType.Accepted,
              problemId: "p1",
              problemTitle: "Two Sum",
              problemSlug: "two-sum",
              occurredAt: "2026-01-01T00:02:00.000Z",
              submissionId: "sub_2",
              languageName: "Python",
            },
            {
              type: AdminGameHistoryEventType.Skipped,
              problemId: "p2",
              problemTitle: "Merge Intervals",
              problemSlug: "merge-intervals",
              occurredAt: null,
              submissionId: null,
              languageName: null,
            },
          ],
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminGamePlayerHistory>);

    render(
      <AdminGamePlayerHistoryTabs
        gameId="game_1"
        participants={[buildParticipant()]}
      />
    );

    expect(screen.getAllByText("Two Sum")).toHaveLength(2);
    expect(screen.getByText("Merge Intervals")).toBeVisible();
    expect(screen.getByText("Solved")).toBeVisible();
    expect(screen.getByText("Wrong answer")).toBeVisible();
    expect(screen.getByText("Skipped")).toBeVisible();
    expect(screen.getByText("Time unknown")).toBeVisible();
    expect(screen.getAllByRole("link", { name: "View" })).toHaveLength(2);
  });

  it("switches the visible history when a different player's tab is clicked", async () => {
    const user = userEvent.setup();
    mockUseAdminGamePlayerHistory.mockReturnValue({
      data: [
        {
          userId: "u1",
          events: [
            {
              type: AdminGameHistoryEventType.Accepted,
              problemId: "p1",
              problemTitle: "Two Sum",
              problemSlug: "two-sum",
              occurredAt: "2026-01-01T00:00:00.000Z",
              submissionId: "sub_1",
              languageName: "Python",
            },
          ],
        },
        {
          userId: "u2",
          events: [
            {
              type: AdminGameHistoryEventType.Accepted,
              problemId: "p3",
              problemTitle: "Valid Parentheses",
              problemSlug: "valid-parentheses",
              occurredAt: "2026-01-01T00:00:00.000Z",
              submissionId: "sub_3",
              languageName: "Go",
            },
          ],
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminGamePlayerHistory>);

    render(
      <AdminGamePlayerHistoryTabs
        gameId="game_1"
        participants={[
          buildParticipant({ userId: "u1", username: "alice" }),
          buildParticipant({ userId: "u2", username: "bob" }),
        ]}
      />
    );

    expect(screen.getByText("Two Sum")).toBeVisible();
    expect(screen.queryByText("Valid Parentheses")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /bob/i }));

    expect(screen.getByText("Valid Parentheses")).toBeVisible();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
  });
});
