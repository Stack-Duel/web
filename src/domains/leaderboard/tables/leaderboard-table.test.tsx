import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LeaderboardTable from "./leaderboard-table";
import { useLeaderboard } from "../api/get-leaderboard";
import { GameModeKey } from "@/domains/game/models/game-mode";
import type { LeaderboardEntry } from "../models/leaderboard-entry";

vi.mock("../api/get-leaderboard", () => ({ useLeaderboard: vi.fn() }));

const mockedUseLeaderboard = vi.mocked(useLeaderboard);

function buildEntry(
  overrides: Partial<LeaderboardEntry> = {}
): LeaderboardEntry {
  return {
    rank: 1,
    userId: "user-1",
    username: "alice",
    imageUrl: null,
    highScore: 42,
    isCurrentUser: false,
    ...overrides,
  };
}

describe("LeaderboardTable", () => {
  it("lists ranked players with their high score", () => {
    mockedUseLeaderboard.mockReturnValue({
      data: {
        results: [buildEntry()],
        total: 1,
        page: 1,
        size: 25,
        timestamp: "",
      },
      isLoading: false,
    } as never);

    render(
      <LeaderboardTable
        gameModeKey={GameModeKey.SoloRush}
        timeLimitInSeconds={180}
      />
    );

    expect(screen.getByText("#1")).toBeVisible();
    expect(screen.getByText("alice")).toBeVisible();
    expect(screen.getByText("42")).toBeVisible();
  });

  it("marks the requesting user's own row", () => {
    mockedUseLeaderboard.mockReturnValue({
      data: {
        results: [buildEntry({ isCurrentUser: true })],
        total: 1,
        page: 1,
        size: 25,
        timestamp: "",
      },
      isLoading: false,
    } as never);

    render(
      <LeaderboardTable
        gameModeKey={GameModeKey.SoloRush}
        timeLimitInSeconds={180}
      />
    );

    expect(screen.getByText("You")).toBeVisible();
  });

  it("shows no results when the leaderboard is empty", () => {
    mockedUseLeaderboard.mockReturnValue({
      data: { results: [], total: 0, page: 1, size: 25, timestamp: "" },
      isLoading: false,
    } as never);

    render(
      <LeaderboardTable
        gameModeKey={GameModeKey.SoloRush}
        timeLimitInSeconds={180}
      />
    );

    expect(screen.getByText("No results.")).toBeVisible();
  });
});
