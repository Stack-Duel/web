import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RampHistoryTab from "./ramp-history-tab";
import { useOwnGameProblemHistory } from "../../hooks/use-own-game-problem-history";
import type { GameProblemHistory } from "../../models/game";

vi.mock("../../hooks/use-own-game-problem-history", () => ({
  useOwnGameProblemHistory: vi.fn(),
}));
vi.mock("./ramp-problem-history", () => ({
  default: ({ solvedProblemIds }: { solvedProblemIds: string[] }) => (
    <div>Solved: {solvedProblemIds.join(",") || "none"}</div>
  ),
}));

const mockedUseOwnGameProblemHistory = vi.mocked(useOwnGameProblemHistory);

describe("RampHistoryTab", () => {
  it("shows no solved problems when there is no own history", () => {
    mockedUseOwnGameProblemHistory.mockReturnValue(undefined);

    render(
      <RampHistoryTab
        gameId="game-1"
        currentProblemId={null}
        viewingProblemId={null}
        onSelectProblem={vi.fn()}
        onReturnToCurrent={vi.fn()}
      />
    );

    expect(screen.getByText("Solved: none")).toBeVisible();
  });

  it("shows the solved problems in reverse order", () => {
    const history: GameProblemHistory = {
      userId: "user-1",
      solvedProblemIds: ["problem-1", "problem-2"],
      solvedProblemSubmissions: [],
    };
    mockedUseOwnGameProblemHistory.mockReturnValue(history);

    render(
      <RampHistoryTab
        gameId="game-1"
        currentProblemId={null}
        viewingProblemId={null}
        onSelectProblem={vi.fn()}
        onReturnToCurrent={vi.fn()}
      />
    );

    expect(screen.getByText("Solved: problem-2,problem-1")).toBeVisible();
  });
});
